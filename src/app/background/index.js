import { Extension, Message } from '../commons/browser/chrome';

const empty = document.getElementById('empty');
const range = document.createRange();
range.selectNodeContents(empty);

let timer;
let count = 0;

Message.on('clearClipboard', ([delay]) => {
  clearInterval(timer);
  count = delay;
  timer = setInterval(() => {
    Extension.setBadgeBackgroundColor('#f00');
    Extension.setBadgeText(`${count}`);
    if (!count--) {
      clearInterval(timer);
      Extension.setBadgeText('');
      try {
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
      } catch(e){
        console.error(e.stack);
      }
    }
  }, 1000);
});