function log(...msg) {
  console.log('%c계란말이', 'background-color: #ffe25e; padding:5px', ...msg)
}
function error(...msg) {
  console.error('%c계란말이', 'background-color: #ffe25e; padding:5px;color:black', ...msg)
}

export default {
  log,
  error
}