// js/chatbot-widget.js

document.addEventListener('DOMContentLoaded', () => {
  // 1) Inject the full-screen iframe
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

  // 2) (Optional) If you ever want to use the deploy/index.js approach:
  // const script = document.createElement('script');
  // script.src = 'https://bot.orimon.ai/deploy/index.js';
  // script.setAttribute('tenantId', '0bf460a4-f3ac-4472-a370-ea0ac73ed425');
  // document.body.appendChild(script);
});
