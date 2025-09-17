document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  const joinBtn = document.getElementById('joinBtn');
  const usernameInput = document.getElementById('username');
  const form = document.getElementById('form');
  const input = document.getElementById('input');
  const messages = document.getElementById('messages');
  const usersList = document.getElementById('users');
  const typingDiv = document.getElementById('typing');

  let joined = false;
  let typingTimeout;

  function appendMessage(html) {
    const li = document.createElement('li');
    li.innerHTML = html;
    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
  }


  joinBtn.addEventListener('click', () => {
    const name = usernameInput.value.trim() || 'Anonymous';
    console.log("join button working");
    
    socket.emit('join', name);
    joined = true;
    usernameInput.disabled = true;
    joinBtn.disabled = true;
  });

  // Send message
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!input.value || !joined) return;
    socket.emit('chat message', input.value);
    input.value = '';
  });

  // Typing indicator
  input.addEventListener('input', () => {
    if (!joined) return;    
    socket.emit('typing', true);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => socket.emit('typing', false), 700);
  });

  // Receive chat message
  socket.on('chat message', (payload) => {
    const time = new Date(payload.ts).toLocaleTimeString();
    appendMessage(
      `<strong>${escapeHtml(payload.username)}</strong> <span class="ts">${time}</span><br>${escapeHtml(payload.message)}`
    );
  });

  // System messages (join/leave)
  socket.on('system message', (msg) => {
    appendMessage(`<em>${escapeHtml(msg)}</em>`);
  });

  // Update user list
  socket.on('users', (users) => {
    usersList.innerHTML = users.map(u => `<li>${escapeHtml(u)}</li>`).join('');
  });

  // Show typing status
  socket.on('typing', ({ username, isTyping }) => {
    typingDiv.textContent = isTyping ? `${username} is typing...` : '';
  });

  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
