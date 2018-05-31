//-------------------- 右键菜单演示 ------------------------//
chrome.contextMenus.create({
	title: "测试右键菜单",
	onclick: function(){
		chrome.notifications.create(null, {
			type: 'basic',
			iconUrl: 'img/icon.png',
			title: '这是标题',
			message: '您刚才点击了自定义右键菜单！'
		});
	}
});
chrome.contextMenus.create({
	title: '使用度娘搜索：%s', // %s表示选中的文字
	contexts: ['selection'], // 只有当选中文字时才会出现此右键菜单
	onclick: function(params)
	{
		// 注意不能使用location.href，因为location是属于background的window对象
		chrome.tabs.create({url: 'https://www.baidu.com/s?ie=utf-8&wd=' + encodeURI(params.selectionText)});
	}
});



//-------------------- badge演示 ------------------------//
/*(function()
{
	var showBadge = false;
	var menuId = chrome.contextMenus.create({
		title: '显示图标上的Badge',
		type: 'checkbox',
		checked: false,
		onclick: function() {
			if(!showBadge)
			{
				chrome.browserAction.setBadgeText({text: 'New'});
				chrome.browserAction.setBadgeBackgroundColor({color: [255, 0, 0, 255]});
				chrome.contextMenus.update(menuId, {title: '隐藏图标上的Badge', checked: true});
			}
			else
			{
				chrome.browserAction.setBadgeText({text: ''});
				chrome.browserAction.setBadgeBackgroundColor({color: [0, 0, 0, 0]});
				chrome.contextMenus.update(menuId, {title: '显示图标上的Badge', checked: false});
			}
			showBadge = !showBadge;
		}
	});
})();*/


// 获取当前选项卡ID
function getCurrentTabId(callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		if(callback) callback(tabs.length ? tabs[0].id: null);
	});
}

// 当前标签打开某个链接
function openUrlCurrentTab(url)
{
	getCurrentTabId(tabId => {
		chrome.tabs.update(tabId, {url: url});
	})
}

// 新标签打开某个链接
function openUrlNewTab(url)
{
	chrome.tabs.create({url: url});
}

// omnibox 演示
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
	console.log('inputChanged: ' + text);
	if(!text) return;
	if(text == '') {
		suggest([
			{content: '中国' + text, description: '你要找“中国美女”吗？'},
		]);
	}
});

// 当用户接收关键字建议时触发
chrome.omnibox.onInputEntered.addListener((text) => {
    console.log('inputEntered: ' + text);
	if(!text) return;
	var href = '';
    if(text.endsWith('美女')) href = 'http://image.baidu.com/search/index?tn=baiduimage&ie=utf-8&word=' + text;
	else if(text.startsWith('百度搜索')) href = 'https://www.baidu.com/s?ie=UTF-8&wd=' + text.replace('百度搜索 ', '');
	else if(text.startsWith('谷歌搜索')) href = 'https://www.google.com.tw/search?q=' + text.replace('谷歌搜索 ', '');
	else href = 'https://www.baidu.com/s?ie=UTF-8&wd=' + text;
	openUrlCurrentTab(href);
});

// 预留一个方法给popup调用
function testBackground() {
	alert('你好，我是background！');
}

// 是否显示图片
var showImage;
chrome.storage.sync.get({showImage: true}, function(items) {
	showImage = items.showImage;
});

const urls = [];

chrome.webNavigation.onDOMContentLoaded.addListener(details => {
	if (details.url.match(/^http[s]?:\/\/bbs\.sgamer\.com\/forum-44-[0-9]{1,9}\.html$/)) {
		mainMarkNames(details.url);
	}
	if (details.url.match(/^http[s]?:\/\/bbs\.sgamer\.com\/thread-[0-9-]{1,100}\.html/)) {
		detailMarkNames(details.url);
		addReplaceListener(details.url);
	}
});

// 获取当前选项卡ID
function getCurrentTabId(callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		if(callback) callback(tabs.length ? tabs[0].id: null);
	});
}

// 向content-script注入JS片段
function executeScriptToCurrentTab(code)
{
	getCurrentTabId((tabId) =>
	{
		chrome.tabs.executeScript(tabId, {code: code});
	});
}

function mainMarkNames (url) {
	executeScriptToCurrentTab(`
		console.log('主页面增加标签' + '${url}');
		var markList = $("a[href*='space-uid-']");
		for (let i in markList) {
			markList[i].innerText = (markList[i].innerText + '[标签]');
		}
	`);
}


function detailMarkNames (url) {
	chrome.storage.sync.get(['tags'], (items) => {
		let tagList = items.tags;
		executeScriptToCurrentTab(`
			console.log('详情页面增加标签' + '${url}');
			var markList = $("div.authi a.xw1");
			for (let i in markList) {
				markList[i].innerText = (markList[i].innerText + '[标签]');
			}
		`);
	});
}

function py (text) {
	const normalStyle = {style: Pinyin.STYLE_NORMAL};
	try {
		let result = Pinyin(text, normalStyle).join('');
		return result;
	} catch (err) {
		console.log(err);
		return '*_*';
	}
}

function getPinyinObj(shiledWords) {
	let obj = {};
	for (let i of shiledWords) {
		obj[i] = py(i);
	}
	return obj;
}

function addReplaceListener (url) {
	chrome.storage.sync.get(['words'], (items) => {
		let shiledWords = items.words || [];
		let pinyinObj = getPinyinObj(shiledWords);
		console.log('当前屏蔽字列表' + `${pinyinObj}`);
		executeScriptToCurrentTab(`
			console.log('增加监听事件' + '${url}');

			function replacedText (text, selector) {
				let textArr = text.split('');
				let pinyinObj = ${JSON.stringify(pinyinObj)};
				for (let i in textArr) {
					if (pinyinObj[textArr[i]]) {
						console.log('替换屏蔽字 ' + textArr[i] + ' -> ' + pinyinObj[textArr[i]]);
						textArr[i] = pinyinObj[textArr[i]];
					}
				}
				let replacedText = textArr.join('');
				$(selector).val(replacedText);
			}
			$("#fastpostmessage").bind('input propertychange', function(){  
				let text = $("textarea#fastpostmessage").val();
				replacedText(text, '#fastpostmessage');
			});
		`);
	});
}

