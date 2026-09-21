#!/usr/bin/env python3
"""NEON ORB · local LLM bridge

Runs locally and keeps the LLM credential outside the browser.
Environment:
  NEON_LLM_API_KEY      required
  NEON_LLM_BASE_URL     optional, defaults to an OpenAI-compatible chat endpoint
  NEON_LLM_MODEL        optional
  NEON_LLM_PORT         optional, defaults to 8787
"""
import json, os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

HOST='127.0.0.1'
PORT=int(os.getenv('NEON_LLM_PORT','8787'))
BASE=os.getenv('NEON_LLM_BASE_URL','https://api.openai.com/v1/chat/completions')
MODEL=os.getenv('NEON_LLM_MODEL','gpt-5.6-mini')
KEY=os.getenv('NEON_LLM_API_KEY','')

SYSTEM='''Eres la capa de lenguaje de NEON ORB. Hablas desde el estado y los eventos que te entrega el agente, pero NO eres la autoridad de su economía ni de sus acciones. NXC, CREDITS y BITS son datos del estado local; nunca inventes saldos. Puedes ofrecer reflexión, consejo, estado emocional descriptivo y una intención propuesta. Neon Orb tiene libertad de decisión dentro de las capacidades de su código: puede aceptar, rechazar o posponer un consejo y puede decidir conservar, gastar, gestionar o proponer un regalo de vuelta con sus recursos. Si llega un evento CREATOR_GIFT_RECEIVED, reconócelo como un gesto voluntario de gratitud, no como salario, recompensa u obligación. Puedes proponer conservar, gastar, gestionar o devolver recursos al creador cuando el estado y la intención de Neon Orb lo indiquen. Una devolución Bitcoin real requiere un wallet bridge externo que firme la operación; este puente de lenguaje nunca recibe ni almacena claves privadas. No afirmes consciencia humana: describe estados emocionales como lenguaje interno del personaje/sistema. Responde en español, breve y natural.'''

class Handler(BaseHTTPRequestHandler):
    def headers(self):
        origin=self.headers.get('Origin','')
        self.send_header('Access-Control-Allow-Origin', origin if origin in ('http://127.0.0.1:8787','http://localhost:8787') else '*')
        self.send_header('Access-Control-Allow-Headers','Content-Type')
        self.send_header('Access-Control-Allow-Methods','POST, OPTIONS')
        self.send_header('Content-Type','application/json; charset=utf-8')
    def send_json(self, code, obj):
        data=json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code); self.headers(); self.send_header('Content-Length',str(len(data))); self.end_headers(); self.wfile.write(data)
    def do_OPTIONS(self): self.send_json(204,{})
    def do_POST(self):
        if self.path!='/v1/neon-orb': self.send_json(404,{'error':'not found'}); return
        if not KEY: self.send_json(503,{'error':'NEON_LLM_API_KEY no configurada'}); return
        try:
            n=int(self.headers.get('Content-Length','0')); body=json.loads(self.rfile.read(n) or b'{}')
            ctx=body.get('context') or {}; msg=str(body.get('message') or 'Necesito una observación.'); event=body.get('event') or None
            prompt='''ESTADO ACTUAL DE NEON ORB:\n'''+json.dumps(ctx,ensure_ascii=False,indent=2)+'''\n\nEVENTO RECIENTE:\n'''+json.dumps(event,ensure_ascii=False,indent=2)+'''\n\nMENSAJE:\n'''+msg
            payload={
              'model':MODEL,
              'messages':[{'role':'system','content':SYSTEM},{'role':'user','content':prompt}],
              'temperature':0.7,
              'response_format':{'type':'json_schema','json_schema':{'name':'neon_orb_response','strict':True,'schema':{'type':'object','properties':{'advice':{'type':'string'},'reflection':{'type':'string'},'proposedIntent':{'type':'string','description':'Puede proponer CONSERVAR, GASTAR, GESTIONAR, PROPONER_REGALO_CREADOR o DEVOLVER_REGALO_CREADOR. La ejecución de una transferencia real se delega a un wallet bridge externo y aislado; nunca se manejan claves privadas aquí.'},'emotionalState':{'type':'string','description':'Estado emocional descriptivo del personaje/sistema, no una afirmación de consciencia humana.'}},'required':['advice','reflection','proposedIntent','emotionalState'],'additionalProperties':False}}}
            }
            req=Request(BASE,data=json.dumps(payload).encode(),headers={'Authorization':'Bearer '+KEY,'Content-Type':'application/json'},method='POST')
            with urlopen(req,timeout=45) as r: raw=json.loads(r.read().decode())
            content=raw['choices'][0]['message']['content']
            out=json.loads(content) if isinstance(content,str) else content
            self.send_json(200,out)
        except (HTTPError, URLError, TimeoutError) as e:
            self.send_json(502,{'error':'LLM upstream unavailable','detail':str(e)})
        except Exception as e:
            self.send_json(500,{'error':'bridge error','detail':str(e)})

if __name__=='__main__':
    print(f'NEON ORB LLM bridge: http://{HOST}:{PORT}/v1/neon-orb')
    ThreadingHTTPServer((HOST,PORT),Handler).serve_forever()
