const chat = document.querySelector('#chat');
const form = document.querySelector('#composer');
const input = document.querySelector('#prompt');
const send = document.querySelector('#sendButton');
const clear = document.querySelector('#clearButton');
const welcome = document.querySelector('#welcome');
const statusText = document.querySelector('#statusText');
const status = document.querySelector('.status');
let messages = JSON.parse(localStorage.getItem('jaydari_history') || '[]');

function save() { localStorage.setItem('jaydari_history', JSON.stringify(messages)); }
function scrollBottom() { chat.scrollTop = chat.scrollHeight; }
function addMessage(role, content, persist = true) {
  welcome?.remove();
  const item = document.createElement('article'); item.className = `message ${role}`;
  const avatar = document.createElement('div'); avatar.className = 'avatar'; avatar.textContent = role === 'user' ? 'YOU' : 'J';
  const body = document.createElement('div');
  const bubble = document.createElement('div'); bubble.className = 'bubble'; bubble.textContent = content; body.appendChild(bubble);
  if (role === 'assistant') { const copy = document.createElement('button'); copy.className = 'copy'; copy.textContent = 'Copy'; copy.onclick = () => navigator.clipboard.writeText(content); body.appendChild(copy); }
  item.append(avatar, body); chat.appendChild(item); scrollBottom();
  if (persist) { messages.push({ role, content }); save(); }
  return item;
}
function setBusy(value) { send.disabled = value; input.disabled = value; }
function autoGrow() { input.style.height='auto'; input.style.height = Math.min(input.scrollHeight, 180) + 'px'; }

async function getStatus() {
  try { const result = await fetch('/api/health'); const data = await result.json(); status.classList.add('online'); statusText.textContent = data.ai_configured ? 'AI connected' : 'Setup required'; }
  catch { statusText.textContent = 'Server offline'; }
}
async function submit(text) {
  if (!text.trim()) return;
  addMessage('user', text.trim()); input.value=''; autoGrow(); setBusy(true);
  const typing = addMessage('assistant', 'Thinking...', false); typing.classList.add('typing');
  try {
    const response = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({messages}) });
    const data = await response.json(); typing.remove();
    if (!response.ok) throw new Error(data.detail || 'Something went wrong.');
    addMessage('assistant', data.reply);
  } catch (error) { typing.remove(); addMessage('assistant', `Connection error: ${error.message}`); }
  finally { setBusy(false); input.focus(); getStatus(); }
}
messages.forEach(message => addMessage(message.role, message.content, false));
form.addEventListener('submit', event => { event.preventDefault(); submit(input.value); });
input.addEventListener('input', autoGrow);
input.addEventListener('keydown', event => { if(event.key==='Enter' && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); } });
document.querySelectorAll('[data-prompt]').forEach(button => button.addEventListener('click', () => { input.value=button.dataset.prompt; autoGrow(); input.focus(); }));
clear.addEventListener('click', () => { messages=[]; save(); chat.innerHTML=''; location.reload(); });
getStatus();
