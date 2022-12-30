const buttonGroupBy = document.getElementById("group-by-button");
buttonGroupBy.addEventListener("click", async function () {
    chrome.runtime.sendMessage('group-by-domain');
});

const ungroupButton = document.getElementById("ungroup-button");
ungroupButton.addEventListener("click", async function () {
    chrome.runtime.sendMessage('ungroup');
});

const deleteDuplicateButton = document.getElementById("delete-duplicate-button");
deleteDuplicateButton.addEventListener("click", async function () {
    chrome.runtime.sendMessage('delete-duplicate');
});

const sortByTitel = document.getElementById("sort-by-titel-button");
sortByTitel.addEventListener("click", async function () {
    chrome.runtime.sendMessage('sort-by-titel');
});

const sortByDomain = document.getElementById("sort-by-domain-button");
sortByDomain.addEventListener("click", async () => {
    chrome.runtime.sendMessage('sort-by-domain');
});
