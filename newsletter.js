(function () {
  var form = document.getElementById('newsletter-form');
  var status = document.getElementById('newsletter-status');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = Object.fromEntries(new FormData(form));
    status.textContent = 'Sending…';
    status.className = 'newsletter-status';

    fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(function (r) {
        return r.json().then(function (body) { return { ok: r.ok, body: body }; });
      })
      .then(function (res) {
        if (res.ok) {
          status.textContent = 'Subscribed — thank you.';
          status.className = 'newsletter-status success';
          form.reset();
        } else {
          status.textContent = res.body.error || 'Something went wrong.';
          status.className = 'newsletter-status error';
        }
      })
      .catch(function () {
        status.textContent = 'Network error. Please try again.';
        status.className = 'newsletter-status error';
      });
  });
})();
