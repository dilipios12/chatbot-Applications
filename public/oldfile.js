
(function () {
  var widgetId = 'xyz123abc4567'; // <-- Replace this dynamically if needed
  var pp = document.createElement('script'),
      ppr = document.getElementsByTagName('script')[0];
  pp.type = 'text/javascript';
  pp.async = true;
  pp.src = (location.protocol === 'https:' ? 'https://' : 'http://') + 'http://45.77.187.108:3000/api/load-widget?id=' + widgetId;
  ppr.parentNode.insertBefore(pp, ppr);
})();
