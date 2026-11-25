// Reads what the sign-in's server function put after the "#": service, status, account and
// reason. Only words from the fixed lists below or plain text ever reach the page (textContent,
// never HTML), so nothing in the address can add links, styles or scripts.
/* global window, document -- it runs in the browser, outside the app's build */
'use strict'

// One line per service a sign-in can connect (its name and what happens next); the server's
// supabase/functions/_shared/connectPage.ts lists the same names.
const SERVICES = {
  wispr: {
    name: 'Wispr Flow',
    next: 'Your finished meetings will appear in Mornfold as notes within the hour.',
  },
  gmail: {
    name: 'Google',
    next: 'Your mail and calendar will start appearing in Mornfold in a few minutes.',
  },
  outlook: {
    name: 'Outlook',
    next: 'Your mail and calendar will start appearing in Mornfold in a few minutes.',
  },
}

/** One plain line, cut to a length: no control or direction characters. */
function plain(text, max) {
  return Array.from(
    String(text)
      // eslint-disable-next-line no-control-regex -- these are exactly the characters to drop
      .replace(/[\u0000-\u001f\u007f-\u009f‎‏‪-‮⁦-⁩]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  )
    .slice(0, max)
    .join('')
}

function show() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const service = SERVICES[params.get('service') ?? '']
  const failed = params.get('status') !== 'connected'
  const name = service ? service.name : 'Your account'
  const account = plain(params.get('account') ?? '', 320)
  const reason = plain(params.get('reason') ?? '', 600)

  document.body.classList.toggle('failed', failed)
  document.title = failed ? `Couldn't connect ${name} · Mornfold` : `${name} is connected · Mornfold`
  document.getElementById('headline').textContent = failed
    ? `Couldn't connect ${service ? service.name : 'your account'}`
    : `${name} is connected`

  const accountLine = document.getElementById('account')
  accountLine.textContent = account
  accountLine.hidden = account === ''

  // The server's reasons already say what to do next (usually "press Connect again").
  document.getElementById('next').textContent = failed
    ? reason || 'Something went wrong. Try again in Mornfold.'
    : (service?.next ?? 'Go back to Mornfold to see it.')
  document.getElementById('open').textContent = failed ? 'Try again in Mornfold' : 'Open Mornfold'
}

document.addEventListener('DOMContentLoaded', show)
window.addEventListener('hashchange', show)
