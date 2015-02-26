function TabManager() {
    var This = Div();



    This.Dragging = false;
    This.LastClicked = null;
    This.Restart = function() {
        console.log("restarting");
        This.Layout = localStorage["layout"];
        if (!This.Layout) {
            This.Layout = "horizontal";
        }
        This.Order = localStorage["categorize"];
        if(!This.Order) {
            This.Order = "alpha";
        }
        This.innerHTML = "";
        chrome.windows.getAll({
            populate: true
        }, function(windows) {
            for (var i = 0; i < windows.length; i++) {
                This.appendChild(Window(windows[i], This));
            }

            if (This.Layout == "blocks") {
                var wins = This.getElementsByClassName("window");
                var highest = 0;
                for (var i = 0; i < wins.length; i++) {
                    console.log(wins[i].clientHeight);
                    if (wins[i].clientHeight > highest) {
                        highest = wins[i].clientHeight;
                    }
                }
                for (var i = 0; i < wins.length; i++) {
                    wins[i].style.height = highest + "px";
                    wins[i].style.width = "auto";
                }
            }

            var addwindow;
            //var deletetabs;
            var pintabs;
            var search;
            var layout;
            var categorize;
            This.appendChild(
                Div("window",
                    search = Txt(),
                    layout = Div("icon windowaction " + This.Layout),
                    //deletetabs = Div("icon windowaction trash"),
                    pintabs = Div("icon windowaction pin"),
                    addwindow = Div("icon windowaction new"),
                    categorize = Div("icon windowaction" + This.Order)
                )
            );

            addwindow.setAttribute('title', 'Add Window');
            //deletetabs.setAttribute('title', 'Delete Tabs');
            pintabs.setAttribute('title', 'Pin Tabs');
            layout.setAttribute('title', 'Toggle Layout');
            categorize.setAttribute('title', 'Organize');
                                    

            search.focus();
            search.select();

            /*deletetabs.on("click",function(){
				var tabs = This.getElementsByClassName("tab selected");
				if(tabs.length){
					var t = [];
					for(var i = 0; i < tabs.length; i++){
						t.push(tabs[i].Tab);
					}
										
					tabs = t;
					var count = 0;
					for(var i = 0; i < tabs.length; i++){
						chrome.tabs.remove(tabs[i].id,function(){
							count++;
							if(count == tabs.length){
								setTimeout(This.Restart,100);
							}
						});
					}
				}else{
					chrome.windows.getCurrent(function(w){
						console.log(w);
						chrome.tabs.getSelected(w.id,function(t){
							chrome.tabs.remove(t.id,This.Restart);
						});
					});
				}
			});*/
            function addWindow() {
                var tabs = This.getElementsByClassName("tab selected");
                var t = [];
                for (var i = 0; i < tabs.length; i++) {
                    t.push(tabs[i].Tab);
                }
                tabs = t;
                var first = tabs.shift();
                var count = 0;
                if (first) {
                    chrome.windows.create({
                        tabId: first.id
                    }, function(w) {
                        chrome.tabs.update(first.id, {
                            pinned: first.pinned
                        });
                        for (var i = 0; i < tabs.length; i++) {
                            (function(tab) {
                                chrome.tabs.move(tab.id, {
                                    windowId: w.id,
                                    index: 1
                                }, function() {
                                    chrome.tabs.update(tab.id, {
                                        pinned: tab.pinned
                                    }, function() {
                                        count++;
                                        if (count == tabs.length) {
                                            This.Restart();
                                        }
                                    });
                                });
                            })(tabs[i]);
                        }
                    });
                } else {
                    chrome.windows.create({});
                    This.Restart();
                }
            }
            addwindow.on("click", addWindow);
            pintabs.on("click", function() {
                var tabs = This.getElementsByClassName("tab selected");
                if (tabs.length) {
                    for (var i = 0; i < tabs.length; i++) {
                        chrome.tabs.update(tabs[i].ID, {
                            pinned: !tabs[i].Pinned
                        }, i == 0 ? This.Restart : function() {});
                    }
                } else {
                    chrome.windows.getCurrent(function(w) {
                        console.log(w);
                        chrome.tabs.getSelected(w.id, function(t) {
                            chrome.tabs.update(t.id, {
                                pinned: !t.pinned
                            }, This.Restart);
                        });
                    });
                }
            });

            search.on("keyup", function() {
                var tabs = This.getElementsByClassName("tab");
                for (var i = 0; i < tabs.length; i++) {
                    var tab = tabs[i];
                    if ((tab.Tab.title + tab.Tab.url).toLowerCase().indexOf(search.value.toLowerCase()) >= 0) {
                        tab.addClass("selected"); 
                        tab.removeClass("ignore");
                    } else {
                        tab.addClass("ignore");
                        tab.removeClass("selected");
                    }
                
                }
                
                
            });
            search.on("keydown", function(e) {
                console.log(e.keyCode);
                if (e.keyCode == 13) {
                    addWindow();
                }
            });

            layout.on("click", function() {
                if (This.Layout == "blocks") {
                    localStorage["layout"] = "horizontal";
                } else if (This.Layout == "horizontal") {
                    localStorage["layout"] = "vertical";
                } else {
                    localStorage["layout"] = "blocks";
                }
                This.Restart();
            });
            
            categorize.on("click", function() {
                if(This.Order == "alpha") {
                    localStorage["categorize"] = "default";
                }
                else{
                    localStorage["categorize"] = "alpha";
                }
                This.Restart();
            });
        });
    }
    This.Restart();

    return This;
}