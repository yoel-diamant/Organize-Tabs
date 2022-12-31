const buttons = document.getElementsByClassName('action-button')
for (let item of buttons) {
    item.addEventListener("click", async function () {
        chrome.runtime.sendMessage(item.id);
    });
};
