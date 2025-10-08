
  // Assuming user is logged in and session is valid on backend
  fetch('http://localhost:3000/api/my-widget')
    .then(res => res.json())
    .then(widgets => {
      widgets.forEach(widget => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = `${location.protocol === 'https:' ? 'https://' : 'http://'}localhost:3000/api/load-widget?id=${widget.widgetId}`;
        script.dataset.widget = widget.widgetId;
        document.body.appendChild(script);
      });
    })
    .catch(err => console.error("Failed to load widget(s):", err));

