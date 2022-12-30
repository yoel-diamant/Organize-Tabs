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

};

async function groupByDomain() {
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
}
async function ungroup() {
    const tabs = await chrome.tabs.query({});
    const tabIds = tabs.map(({ id }) => id)
    chrome.tabs.ungroup(
        tabIds
    )
};

async function deleteDuplicate() {
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
};

async function sortByTitel() {
    const tabs = await chrome.tabs.query({});
    tabs.sort(
        (a, b) => {
            return (a.title > b.title) ? 1 : (a.title === b.title) ? ((a.url > b.url) ? 1 : -1) : -1
        }
    );

    for (let index = 0; index < tabs.length; index++) {
        await chrome.tabs.move(tabs[index].id, { index });
    }
};

async function sortByDomain() {
    const tabs = await chrome.tabs.query({});
    tabs.sort(
        (a, b) => {
            return (extractDomain(a.url) > extractDomain(a.url)) ? 1 : (extractDomain(a.url) === extractDomain(a.url)) ? ((a.url > b.url) ? 1 : -1) : -1
        }
    );

    for (let index = 0; index < tabs.length; index++) {
        await chrome.tabs.move(tabs[index].id, { index });
    }
};

async function callEvent(
    eventId,
) {
    switch (eventId) {
        case 'group-by-domain':
            await groupByDomain();
            break;
        case 'ungroup':
            await ungroup();
            break;
        case 'delete-duplicate':
            await deleteDuplicate();
            break;
        case 'sort-by-titel':
            await sortByTitel();
            break;
        case 'sort-by-domain':
            await sortByDomain();
            break;
        default:
            console.log(`Event ${eventId} not implemented`);
            break;
    }
}
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'group-by-domain',
        title: 'Group By Domain',
    });
    chrome.contextMenus.create({
        id: 'ungroup',
        title: 'Ungroup All Tabs',
    });
    chrome.contextMenus.create({
        id: 'sort-by-domain',
        title: 'Sort By Domain',
    });
    chrome.contextMenus.create({
        id: 'sort-by-titel',
        title: 'Sort By Titel',
    });
    chrome.contextMenus.create({
        id: 'delete-duplicate',
        title: 'Delete Duplicate Tabs',
    });
});

chrome.contextMenus.onClicked.addListener(async function (info, tab) {
    const { menuItemId } = info
    await callEvent(
        menuItemId
    )
});

chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
    if (message) {
        await callEvent(message)
    }
    return true
});
