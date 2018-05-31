console.log('这是content script!');

// 注意，必须设置了run_at=document_start 此段代码才会生效
document.addEventListener('DOMContentLoaded', function()
{
	// 注入自定义JS
	injectCustomJs();

	var kyoPopupMenu={}; 
	kyoPopupMenu = (function(){ 
	return { 
	sys: function (obj) { 
	$('.popup_menu').remove(); 
	popupMenuApp = $('<div class="popup_menu app-menu"><ul><li><a menu="menu1">第九站长</a></li><li><a menu="menu2">百度</a></li><li><a menu="menu3">新浪</a></li></ul></div>') 
		.find('a').attr('href','javascript:;') 
		.end().appendTo('body'); 
		//绑定事件 
		$('.app-menu a[menu="menu1"]').on('click', function (){ 
		window.location.href="http://www.17sucai.com"; 
		}); 
		$('.app-menu a[menu="menu2"]').on('click', function (){ 
		window.location.href="http://www.baidu.com"; 
		}); 
		$('.app-menu a[menu="menu3"]').on('click', function (){ 
		window.location.href="http://www.sina.com.cn"; 
		}); 
		return popupMenuApp; 
		} 
	}})(); 
	//取消右键 
	$('html').on('contextmenu', function (){return false;}).click(function(){ 
		$('.popup_menu').hide(); 
	}); 
	//桌面点击右击 
	$('html').on('contextmenu',function (e){ 
	var popupmenu = kyoPopupMenu.sys(); 
	l = ($(document).width() - e.clientX) < popupmenu.width() ? (e.clientX - popupmenu.width()) : e.clientX; 
	t = ($(document).height() - e.clientY) < popupmenu.height() ? (e.clientY - popupmenu.height()) : e.clientY; 
	popupmenu.css({left: l,top: t}).show(); 
	return false; 
	});
});

// 向页面注入JS
function injectCustomJs(jsPath)
{
	jsPath = jsPath || 'js/inject.js';
	var temp = document.createElement('script');
	temp.setAttribute('type', 'text/javascript');
	// 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
	temp.src = chrome.extension.getURL(jsPath);
	temp.onload = function()
	{
		// 放在页面不好看，执行完后移除掉
		this.parentNode.removeChild(this);
	};
	document.body.appendChild(temp);
}


var tipCount = 0;
// 简单的消息通知
function tip(info) {
	info = info || '';
	var ele = document.createElement('div');
	ele.className = 'chrome-plugin-simple-tip slideInLeft';
	ele.style.top = tipCount * 70 + 20 + 'px';
	ele.innerHTML = `<div>${info}</div>`;
	document.body.appendChild(ele);
	ele.classList.add('animated');
	tipCount++;
	setTimeout(() => {
		ele.style.top = '-100px';
		setTimeout(() => {
			ele.remove();
			tipCount--;
		}, 400);
	}, 3000);
}