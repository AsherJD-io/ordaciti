#!/usr/bin/env bash
# Phase 10 HTTP 502 Integration Test
# Starts a mock OpenAI server + production Next.js app, then POSTs to /api/explain
# and verifies HTTP 502 with structured error for schema-invalid model response.
set -euo pipefail

WORK_DIR="/home/asher/ordaciti"
MOCK_PORT=18923
NEXT_PORT=18924
MOCK_URL="http://127.0.0.1:${MOCK_PORT}"
NEXT_URL="http://127.0.0.1:${NEXT_PORT}"

cleanup() {
  [ -n "${MOCK_PID:-}" ] && kill "$MOCK_PID" 2>/dev/null || true
  [ -n "${NEXT_PID:-}" ] && kill "$NEXT_PID" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "=== Phase 10 HTTP 502 Integration Test ==="
echo ""

# 1. Build
echo "Step 1: Building production bundle..."
cd "$WORK_DIR"
npm run build > /tmp/next_build.log 2>&1
if [ ${PIPESTATUS[0]} -ne 0 ]; then
  echo "FAIL: Build failed"
  tail -20 /tmp/next_build.log
  exit 1
fi
echo "  Build PASSED"
echo ""

# 2. Start mock OpenAI server
echo "Step 2: Starting mock OpenAI server on ${MOCK_PORT}..."
python3 -c "
import http.server, json

class MockHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        if length: self.rfile.read(length)
        resp = {'id':'mock','object':'chat.completion','created':1,'model':'mock',
                'choices':[{'index':0,'message':{'role':'assistant','content':json.dumps({'bad':'response'})},'logprobs':None,'finish_reason':'stop'}],
                'usage':{'prompt_tokens':0,'completion_tokens':0,'total_tokens':0}}
        data = json.dumps(resp).encode()
        self.send_response(200)
        self.send_header('Content-Type','application/json')
        self.send_header('Content-Length',str(len(data)))
        self.end_headers()
        self.wfile.write(data)
    def log_message(self,*a): pass

httpd = http.server.HTTPServer(('127.0.0.1', ${MOCK_PORT}), MockHandler)
httpd.serve_forever()
" &
MOCK_PID=$!
sleep 1
MOCK_CHECK=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${MOCK_URL}/v1/chat/completions" \
  -H "Content-Type: application/json" -d '{"model":"mock","messages":[{"role":"user","content":"hi"}]}' 2>/dev/null || echo "000")
if [ "$MOCK_CHECK" != "200" ]; then
  echo "FAIL: Mock server not responding (got ${MOCK_CHECK})"
  exit 1
fi
echo "  Mock server started (PID ${MOCK_PID}) -- responding 200"
echo ""

# 3. Start production Next.js server
echo "Step 3: Starting production Next.js server on ${NEXT_PORT}..."
cd "$WORK_DIR"
AI_API_KEY=mock AI_MODEL=mock OPENAI_BASE_URL="${MOCK_URL}/v1" npm run start -- --port ${NEXT_PORT} > /tmp/next_start.log 2>&1 &
NEXT_PID=$!
for i in $(seq 1 40); do
  if curl -s -o /dev/null -w "%{http_code}" "${NEXT_URL}/" 2>/dev/null | grep -q "200"; then
    break
  fi
  sleep 0.5
done
echo "  Next.js server started (PID ${NEXT_PID})"
echo ""

# 4. Run the HTTP integration test
echo "Step 4: POST /api/explain with valid project_id..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${NEXT_URL}/api/explain" \
  -H "Content-Type: application/json" \
  -d '{"project_id":"847"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "  HTTP Status: ${HTTP_CODE}"
echo "  Body: ${BODY}"
echo ""

# 5. Assert
FAIL=0

if [ "$HTTP_CODE" != "502" ]; then
  echo "FAIL: Expected HTTP 502, got ${HTTP_CODE}"
  FAIL=1
else
  echo "PASS: HTTP status is 502"
fi

STATUS=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status',''))" 2>/dev/null || echo "")
if [ "$STATUS" != "502" ]; then
  echo "FAIL: Expected body.status=502, got '${STATUS}'"
  FAIL=1
else
  echo "PASS: body.status is 502"
fi

ERROR=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error',''))" 2>/dev/null || echo "")
if [ -z "$ERROR" ]; then
  echo "FAIL: Expected body.error to be a non-empty string"
  FAIL=1
else
  echo "PASS: body.error is present: '${ERROR}'"
fi

echo ""
if [ "$FAIL" -eq 0 ]; then
  echo "=== ALL ASSERTIONS PASSED ==="
else
  echo "=== SOME ASSERTIONS FAILED ==="
  exit 1
fi
