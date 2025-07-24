var resIndex = {"None": {
        "MacOS":{
            9:{
                "22-Install":"http://macintoshgarden.org/sites/macintoshgarden.org/files/apps/Mac_OS_9.2.2_CHUniversal.zip"},
            "X-Install":{
                "Puma":["http://macintoshgarden.org/sites/macintoshgarden.org/files/apps/Mac_OS_X_10.1.3_Install_CD.iso",
                "http://macintoshgarden.org/sites/macintoshgarden.org/files/apps/Mac_OS_X_10.1.3_Install_CD.iso"]}
        },
        "Ubuntu-PowerPC":{
            "Xubuntu":{
                6.06:"https://old-releases.ubuntu.com/releases/xubuntu/dapper/xubuntu-6.06.1-desktop-powerpc.iso",
                "6.06.1-Alternate(CD)":"https://old-releases.ubuntu.com/releases/xubuntu/dapper/xubuntu-6.06.1-alternate-powerpc.iso"
            }
        },
        "iPhone":{
            "APP":{
                "UTM-SE":"https://apps.apple.com/us/app/utm-se-retro-pc-emulator/id1564628856"
            }
        }

}};
// console.log("t");
var nowIndex = resIndex["None"];
var nowName = "";
function print1(a = "|"){
    if("|" === a){
        var list = nowName.split("-");
        list = list.slice(0,list.length-2);
        console.log(list);
        nowIndex = resIndex["None"];
        nowName = "";
        for(var ind in list){
            if(list[ind] !== '') {
                console.log(list[ind]);
                nowIndex = nowIndex[list[ind]];
                nowName += list[ind] + "-";
            }
        }

    } else if(a !== "") {

        nowIndex = nowIndex[a];
        nowName += a + "-";
    }
    $("h2").remove();
    $("#body").append("<h2 id='main'></h2>")
    var main = $("#main");
    if(typeof(nowIndex) !== typeof("1")) {
        if(Object.prototype.toString.call(nowIndex) === '[object Object]') {
            if (nowName.length > 0)
                main.before("<h2 align='center'><i><u><a onclick='print1()'><font color='darkblue'>" + "返回" + "</font></a></u></i></h2>");
            for (var i in nowIndex) {
                var b = 'print1(' + '"' + i + '"' + ');'
                main.before("<h2 align='center'><i><u><a onclick=" + b + "><font color='darkblue'>" + nowName + i + "</font></a></u></i></h2>");
            }
        } else {
            main.before("<h2 align='center'><i><u><a onclick='print1()'><font color='darkblue'>" + "返回" + "</font></a></u></i></h2>");
            main.before("<h2>前往以下链接即可下载:</h2>");
            for(var index in nowIndex) {
                main.before("<h2><font color='darkkhaki'>"+nowIndex[index]+"</h2>");
            }
        }
    } else{
        main.before("<h2 align='center'><i><u><a onclick='print1()'><font color='darkblue'>" + "返回" + "</font></a></u></i></h2>");
        main.before("<h2>前往以下链接即可下载:<br><font color='darkkhaki'>"+nowIndex+"</h2>");
    }
}
print1("");
