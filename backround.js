const ACTIONS = {
    GROUP_BY_DOMAIN: 'group-by-domain',
    UNGROUP: 'ungroup',
    DELETE_DUPLICATE: 'delete-duplicate',
    SORT_BY_DOMAIN: 'sort-by-domain',
    SORT_BY_TITEL: 'sort-by-title',
    SORT_BY_ID: 'sort-by-id',
};

function extractDomain(url) {
    const singleWordTlds = [
        'com',
        'net',
        'org',
    ]
    let domain;
    const splitUrl = url.split('.');
    const suffix = splitUrl[splitUrl.length - 1];
    if (splitUrl.length === 1) {
        domain = url;
    } else if (singleWordTlds.includes(suffix)) {
        domain = splitUrl[splitUrl.length - 2];
    } else {
        domain = splitUrl[splitUrl.length - 3];
    };

    return domain;
};

async function getNormalTabs() {
    return await chrome.tabs.query({});
};

async function groupByDomain() {
    const tabs = await getNormalTabs();
    const tabGroups = {};
    tabs.forEach(tab => {
        var url = new URL(tab.url);
        var domain = extractDomain(url.hostname);
        const tabIds = tabGroups[domain];
        if (!tabIds) {
            tabGroups[domain] = [tab.id];
        } else {
            tabGroups[domain].push(tab.id);
        };

    });
    for (const [url, tabIds] of Object.entries(tabGroups)) {
        if (tabIds.length > 1) {
            const group = await chrome.tabs.group({ tabIds });
            await chrome.tabGroups.update(group, { title: url });
        };
    };
};

async function ungroup() {
    const tabs = await getNormalTabs();
    const tabIds = tabs.map(({ id }) => id);
    chrome.tabs.ungroup(
        tabIds
    );
};

async function deleteDuplicate() {
    const tabs = await getNormalTabs();
    const tabGroups = {};
    tabs.forEach(tab => {
        const url = new URL(tab.url);
        const tabIds = tabGroups[url];
        if (!tabIds) {
            tabGroups[url] = tab.id;
        } else {
            chrome.tabs.remove(
                [tab.id]
            );
        };
    });
};

async function sortByTitle() {
    await sortTabsBy(
        (a, b) => {
            return (a.title > b.title) ? 1 : (a.title === b.title) ? ((a.url > b.url) ? 1 : -1) : -1;
        },
    );
};

async function sortById() {
    await sortTabsBy(
        (a, b) => {
            return (a.id > b.id) ? 1 : -1;
        },
    );
};

async function sortByDomain() {
    await sortTabsBy(
        (a, b) => {
            return (extractDomain(a.url) > extractDomain(a.url)) ? 1 : (extractDomain(a.url) === extractDomain(a.url)) ? ((a.url > b.url) ? 1 : -1) : -1;
        },
    );
};

async function sortTabsBy(byCallback) {
    const tabs = await getNormalTabs();
    tabs.sort(byCallback);

    tabs.forEach(async (tab, index) => {
        await chrome.tabs.move(tab.id, { index });
    });
}

async function callEvent(
    actionKey,
) {
    switch (actionKey) {
        case ACTIONS.GROUP_BY_DOMAIN:
            await groupByDomain();
            break;
        case ACTIONS.UNGROUP:
            await ungroup();
            break;
        case ACTIONS.DELETE_DUPLICATE:
            await deleteDuplicate();
            break;
        case ACTIONS.SORT_BY_TITEL:
            await sortByTitle();
            break;
        case ACTIONS.SORT_BY_DOMAIN:
            await sortByDomain();
            break;
        case ACTIONS.SORT_BY_ID:
            await sortById();
            break;
        default:
            console.error(`Event ${actionKey} not implemented`);
            break;
    }
};

chrome.runtime.onInstalled.addListener(() => {
    const contextMenus = {
        [ACTIONS.GROUP_BY_DOMAIN]: 'Group By Domain',
        [ACTIONS.UNGROUP]: 'Ungroup All Tabs',
        [ACTIONS.SORT_BY_TITEL]: 'Sort By Title',
        [ACTIONS.SORT_BY_DOMAIN]: 'Sort By Domain',
        [ACTIONS.SORT_BY_ID]: 'Sort By Production Date',
        [ACTIONS.DELETE_DUPLICATE]: 'Delete Duplicate Tabs',
    };

    Object.entries(contextMenus).forEach(([id, title]) => {
        chrome.contextMenus.create({
            id,
            title,
        });
    });
});

chrome.contextMenus.onClicked.addListener(async function (info, tab) {
    const { menuItemId } = info;
    await callEvent(menuItemId);
});

chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
    if (message) {
        await callEvent(message);
    }
    return true;
});

chrome.commands.onCommand.addListener(async (command) => {
    await callEvent(command);
});
