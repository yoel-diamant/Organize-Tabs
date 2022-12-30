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

const sortByTitle = document.getElementById("sort-by-title-button");
sortByTitle.addEventListener("click", async function () {
    chrome.runtime.sendMessage('sort-by-title');
});

const sortByDomain = document.getElementById("sort-by-domain-button");
sortByDomain.addEventListener("click", async () => {
    chrome.runtime.sendMessage('sort-by-domain');
});
