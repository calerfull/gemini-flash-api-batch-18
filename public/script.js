document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');
  const fileInput = document.getElementById('file-input');
  const uploadButton = document.getElementById('upload-button');

  // Trigger file input when upload button is clicked
  uploadButton.addEventListener('click', () => {
    fileInput.click();
  });

  // Handle file selection
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
      addMessage(`File selected: ${file.name}`, 'user');
      // Here you can add code to handle the file upload
      console.log('Selected file:', file);
    }
  });

  // Function to add a message to the chat box
  const addMessage = (text, sender) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);

    const iconElement = document.createElement('i');
    iconElement.classList.add('fas', sender === 'user' ? 'fa-user' : 'fa-robot');
    
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');

    if (sender === 'bot' && text === 'Thinking...') {
      messageElement.classList.add('loading-indicator');
      messageContent.innerHTML = '<span></span><span></span><span></span>';
    } else if (sender === 'bot') {
      messageContent.innerHTML = marked.parse(text); // Use marked to parse markdown
    }
    else {
      messageContent.textContent = text;
    }
    
    messageElement.appendChild(iconElement);
    messageElement.appendChild(messageContent);
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageElement;
  };

  // Handle form submission
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMessage = userInput.value.trim();

    if (!userMessage) {
      return;
    }

    // Add user's message to the chat box
    addMessage(userMessage, 'user');

    // Clear the input field
    userInput.value = '';

    // Show a temporary "Thinking..." message
    const thinkingMessage = addMessage('Thinking...', 'bot');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation: [{ role: 'user', text: userMessage }],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from server.');
      }

      const data = await response.json();

      // Remove loading indicator class and replace content
      const messageContent = thinkingMessage.querySelector('.message-content');
      thinkingMessage.classList.remove('loading-indicator');
      if (data && data.result) {
        messageContent.innerHTML = marked.parse(data.result); // Use marked to parse markdown
      } else {
        messageContent.textContent = 'Sorry, no response received.';
      }
    } catch (error) {
      // Show an error message if the fetch fails
      const messageContent = thinkingMessage.querySelector('.message-content');
      thinkingMessage.classList.remove('loading-indicator');
      messageContent.textContent = error.message || 'Failed to get response from server.';
    }
  });
});