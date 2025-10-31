document.addEventListener('DOMContentLoaded', () => {
  const chat = document.getElementById('chat');
  const form = document.getElementById('askForm');
  const questionEl = document.getElementById('question');
  const contextEl = document.getElementById('context');

  function appendMessage(role, text) {
    const el = document.createElement('div');
    el.className = 'msg ' + role;
    el.textContent = text;
    chat.appendChild(el);
    chat.scrollTop = chat.scrollHeight;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = questionEl.value.trim();
    if (!q) return;
    appendMessage('user', q);
    questionEl.value = '';
    appendMessage('assistant', 'Thinking...');

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, context: contextEl.value })
      });
      const data = await res.json();
      // replace the last assistant "Thinking..." message
      const last = chat.querySelector('.assistant:last-child');
      if (last) last.textContent = data.answer ?? 'No answer';
    } catch (err) {
      const last = chat.querySelector('.assistant:last-child');
      if (last) last.textContent = 'Error fetching answer.';
      console.error(err);
    }
  });
});