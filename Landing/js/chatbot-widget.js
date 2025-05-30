
document.addEventListener('DOMContentLoaded', () => {

  const container = document.getElementById('chatbot-container');
  if (container) {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://bot.orimon.ai/?tenantId=0bf460a4-f3ac-4472-a370-ea0ac73ed425&fullScreenBot=true';
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.frameBorder = '0';
    iframe.style.border = 'none';
    container.appendChild(iframe);
  }
});
