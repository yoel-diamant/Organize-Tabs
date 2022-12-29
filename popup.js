const buttonGroupBy = document.getElementById("group-by-button");

function extractDomain(url) {
    const singleWordTlds = ['com', 'net', 'org'];
    const splitUrl = url.split('.');
    const suffix = splitUrl[splitUrl.length];
    if (splitUrl.length === 1) {
        return url;
    }
    else if (singleWordTlds.includes(suffix)) {
        return splitUrl[splitUrl.length - 1];
    } else {
        return splitUrl[splitUrl.length - 2];
    }

}

buttonGroupBy.addEventListener("click", async () => {
    const tabs = await chrome.tabs.query({});

    const tabGroups = {};
    tabs.forEach(tab => {
        var url = new URL(tab.url)
        var domain = extractDomain(url.hostname)
        const tabIds = tabGroups[domain];
        if (!tabIds) {
            tabGroups[domain] = [tab.id];
        } else {
            tabGroups[domain].push(tab.id);
        }

    });
    for (const [url, tabIds] of Object.entries(tabGroups)) {
        if (tabIds.length > 1) {
            const group = await chrome.tabs.group({ tabIds });
            await chrome.tabGroups.update(group, { title: url });
        }
    }
});

const ungroupButton = document.getElementById("ungroup-button");

ungroupButton.addEventListener("click", async () => {
    const tabs = await chrome.tabs.query({});
    const tabIds = tabs.map(({ id }) => id)
    chrome.tabs.ungroup(
        tabIds
    )
});

const deleteDuplicateButton = document.getElementById("delete-duplicate-button");

deleteDuplicateButton.addEventListener("click", async () => {
    const tabs = await chrome.tabs.query({});
    const tabGroups = {};
    tabs.forEach(tab => {
        const url = new URL(tab.url)
        const tabIds = tabGroups[url];
        if (!tabIds) {
            tabGroups[url] = tab.id;
        } else {
            chrome.tabs.remove(
                [tab.id]
            )
        }
    });
});


const sortByTitel = document.getElementById("sort-by-titel-button");

sortByTitel.addEventListener("click", async () => {
    const tabs = await chrome.tabs.query({});
    tabs.sort(
        (a, b) => {
            return (a.title > b.title) ? 1 : (a.title === b.title) ? ((a.url > b.url) ? 1 : -1) : -1
        }
    );

    for (let index = 0; index < tabs.length; index++) {
        await chrome.tabs.move(tabs[index].id, { index });
    }
});

const sortByDomain = document.getElementById("sort-by-domain-button");

sortByDomain.addEventListener("click", async () => {
    const tabs = await chrome.tabs.query({});
    tabs.sort(
        (a, b) => {
            return (extractDomain(a.url) > extractDomain(a.url)) ? 1 : (extractDomain(a.url) === extractDomain(a.url)) ? ((a.url > b.url) ? 1 : -1) : -1
        }
    );

    for (let index = 0; index < tabs.length; index++) {
        await chrome.tabs.move(tabs[index].id, { index });
    }
});