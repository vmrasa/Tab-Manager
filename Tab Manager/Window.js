function Window(w,t){
	var This = Div("window");				
	This.TabManager = t;
	This.ID = w.id;
	This.Window = w;
	
	var addtab = Div("icon add");
	var closewindow = Div("icon close");
	var tabtowindow = Div("icon ttw");
	if(t.Layout == "blocks"){
		This.addClass("block");
	}else{
		addtab.addClass("windowaction");
		closewindow.addClass("windowaction");
		tabtowindow.addClass("windowaction");
	}
	
		
	var tabsperrow = 15;
	var tabs = [];
	for(var i = 0; i < w.tabs.length; i++){
		console.log(w.tabs[i]);
		tabs.push(Tab(w.tabs[i],This));
		if(t.Layout == "vertical"){
			tabs[i].addClass("full");
		}
	}
	tabs.push(closewindow);
	tabs.push(addtab);
	tabs.push(tabtowindow);
	
	if(t.Layout == "blocks"){
		for(var i = 1; i*i < tabs.length; i++);
		tabsperrow = i;
	}else if(t.Layout == "vertical"){
		tabsperrow = 1;
	}
	
	
	
	for(var j = 0; j < tabs.length; j++){	
		if(j % tabsperrow == 0 && j && (j < tabs.length-1 || t.Layout == "blocks")){
			This.appendChild(Div("newliner"));
		}				
		This.appendChild(tabs[j]);
		
	}
	
	addtab.on("click",function(){
		chrome.tabs.create({windowId:w.id,},function(){
			This.TabManager.Restart();
		});
	});
	
	closewindow.on("click",function(){
		chrome.windows.remove(w.id,function(){
			This.TabManager.Restart();
		});
	});
	
	tabtowindow.on("click",function() {
		chrome.tabs.query({highlighted:true, currentWindow:true}, function(tabs) {
			var tabsToMove = tabs.map(function(tab) { return tab.id; });
		if (tabsToMove.length == 0)
			return;
		chrome.windows.create(function(newWindow) {
			chrome.tabs.query({windowId:w.id}, function(newTabs) {
				chrome.tabs.move(tabsToMove, {windowId:w.id,index:-1}, function(movedTabs) {
					chrome.tabs.remove(newTabs[0].id);
					});
				});
			});
		});
	});
	return This;
}

