// Saves options to chrome.storage
function save_options() {
  var target = document.getElementById('target').value
  var username = document.getElementById('username').value
  var password = document.getElementById('password').value

  chrome.storage.sync.set(
    {
      target,
      username,
      password
    },
    function () {
      // Update status to let user know options were saved.
      var status = document.getElementById('status')
      status.textContent = 'Options saved.'
      setTimeout(function () {
        status.textContent = ''
      }, 750)
    }
  )
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get(
    {
      target: '',
      username: '',
      password: ''
    },
    function (items) {
      document.getElementById('target').value = items.target
      document.getElementById('username').value = items.username
      document.getElementById('password').value = items.password
    }
  )
}
document.addEventListener('DOMContentLoaded', restore_options)
document.getElementById('save').addEventListener('click', save_options)
