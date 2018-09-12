/* 
じゃんけんマシン
 篠本 滋「情報処理概論-予測とシミュレーション」（岩波書店）
 6．5節「じゃんけんマシンを作ってみよう」 pp101-107．
C code:  篠本 滋　2003/05/28．
javascript code:  中村和輝 2018/03/01.
 */

var N=5;	// パーセプトロンで用いる記録の長さ
/* player : プレイヤーの直前の手
 * record[3][N] : 過去のプレイヤーの手(3行(rsp)x列)
 * weight[3][3][N] : 重み関数3*N行列
 * pred[3] : 予測ユニットの入力
 */
var graph_height = 440;
var graph_width = 240;
var graph_base = 24;
var Match;	// 勝負が決まるまでの勝ち数
var game;		// 現在のゲーム数
var predhand;	// 次の予測手
var rec_hands="";	// 記録用
var results=[];	// [0]勝ち、[1]負け、[2]あいこ
for(var i=0;i<3;i++){
	results[i]=new Array();
	results[i][0]=0;
}
var pred=[];
var weight=[];
var ini_weight="";
var fin_weight="";
var record=[];
for(var i=0;i<3;i++){
	weight[i] = new Array();
	for(var j=0;j<3;j++){
		record[j] = new Array();
		weight[i][j] = new Array();
		for(var k=0;k<N;k++){
			record[j][k] = 0;
			weight[i][j][k] = Math.random() * 4 - 2.0;
			ini_weight += String(weight[i][j][k]) + " ";
		}
	}
}

//初期化
function Reset(){
	ini_weight=""
	fin_weight="";
	for(var i=0;i<3;i++){
		for(var j=0;j<3;j++){
			for(var k=0;k<N;k++){
				record[j][k] = 0;
				weight[i][j][k] = Math.random() * 4 - 2.0;
				ini_weight += String(weight[i][j][k]) + " ";
			}
		}
		pred[i] = 0;
		results[i][0]=0;
	}
	//Match = Number(document.form.match.value);
	Match = 30;
	game=0;
	rec_hands="";
	document.getElementById("final_result").innerHTML = '';
	document.getElementById("final_result3").innerHTML = '';
	// 適当な値を相手の手の初期値として指定
	var plhand = Math.floor( Math.random() * 3 + 1 );
	rec_hands += String(plhand);
	var pre = perceptron(plhand);
	/* (pre+1)%3+1はパーセプトロンの予測手predに対して勝つ「手」
	pre=1(グー)   :(pre+1)%3+1=3(パー)
	pre=2(チョキ) :(pre+1)%3+1=1(グー)
	pre=3(パー)   :(pre+1)%3+1=2(チョキ)*/
	predhand=(pre+1)%3+1;
	var resultTimeline = anime.timeline();
	// 描画の初期化
	var wrap = d3.select('#graph');
	wrap.select("svg").remove(); // initialization
	var svg = wrap.append("svg").attr("width",graph_base+graph_width).attr("height",graph_height);
 svg.append("rect").attr("x", graph_base).attr("y", 0).attr("width", graph_width).attr("height", graph_height).attr("fill","#ffffff").attr("stroke","#000000").attr("stroke-width",5);
 //svg.append("line").attr("x1", graph_base).attr("x2", graph_base+graph_width).attr("y1", graph_height*0.1).attr("y2",graph_height*0.1).attr("stroke","#ff0055").attr("stroke-width",2);
 // ラベル
 svg.append("line").attr("x1", graph_base+graph_width*0.1).attr("x2", graph_base+graph_width*0.3).attr("y1", graph_height*0.2).attr("y2",graph_height*0.2).attr("stroke","#00A0E9").attr("stroke-width",8);
 svg.append("text").text("あなたの勝ち").attr("x",graph_base+graph_width*0.3+10).attr("y",graph_height*0.2).attr({'dy': ".35em", 'fill': "black" });
 svg.append("line").attr("x1", graph_base+graph_width*0.1).attr("x2", graph_base+graph_width*0.3).attr("y1", graph_height*0.2+20).attr("y2",graph_height*0.2+20).attr("stroke","#E60012").attr("stroke-width",8);
 svg.append("text").text("マシンの勝ち").attr("x",graph_base+graph_width*0.3+10).attr("y",graph_height*0.2+20).attr({'dy': ".35em", 'fill': "black" });
 svg.append("line").attr("x1", graph_base+graph_width*0.1).attr("x2", graph_base+graph_width*0.3).attr("y1", graph_height*0.2+40).attr("y2",graph_height*0.2+40).attr("stroke","#ffD700").attr("stroke-width",8);
 svg.append("text").text("　　あいこ　").attr("x",graph_base+graph_width*0.3+10).attr("y",graph_height*0.2+40).attr({'dy': ".35em", 'fill': "black" });

 svg.append("text").text("0").attr("x",graph_base-20).attr("y",graph_height-10).attr({'dy': ".35em", 'fill': "black" });
 document.getElementById("results").innerHTML = "<font color='#6970e9'>勝ち:0回</font>、<font color='#e9473f'>負け:0回</font>、<font color='#319e34'>あいこ:0回</font>";

    /* 勝敗表示を消す */
	resultTimeline.add({
		targets: '#win',
		duration: 1,
		opacity: 0,
		easing: 'easeInOutQuart'
	});
    /* マシンの手をもどす */
	resultTimeline.add({
		targets: '.m_rock_copy, .m_scissors_copy, .m_paper_copy',
		translateY: 0,
		translateX:0,
		scale: 1,
		duration: 1,
		easing: 'easeInOutQuart'
	});
	/* プレイヤーの出した手を戻す */
	resultTimeline.add({
		targets: '.rock_copy, .scissors_copy, .paper_copy',
		translateY: 0,
		translateX:0,
		scale: 1,
		duration: 1,
		easing: 'easeInOutQuart'
	});
	var retry = document.getElementById("final_result2")
	retry.style.display = "none";
	var iq = document.getElementById("final_result3")
	iq.style.display = "none";
}


//もう一回(データは初期化しない)
function Retry(){
	for(var i=0;i<3;i++){
		pred[i] = 0;
		results[i][0]=0;
	}
	// Match = Number(document.form.match.value);
	Match = 30;
	game=0;
	document.getElementById("final_result").innerHTML = '';
	// 適当な値を相手の手の初期値として指定
	var plhand = Math.floor( Math.random() * 3 + 1 );
	var pre = perceptron(plhand);
	/* (pre+1)%3+1はパーセプトロンの予測手predに対して勝つ「手」
	pre=1(グー)   :(pre+1)%3+1=3(パー)
	pre=2(チョキ) :(pre+1)%3+1=1(グー)
	pre=3(パー)   :(pre+1)%3+1=2(チョキ)*/
	predhand=(pre+1)%3+1;
	var resultTimeline = anime.timeline();
	// 描画の初期化
	var wrap = d3.select('#graph');
	wrap.select("svg").remove(); // initialization
	var svg = wrap.append("svg").attr("width",graph_width).attr("height",graph_height);
 svg.append("rect").attr("x", graph_base).attr("y", 0).attr("width", graph_base+graph_width).attr("height", graph_height).attr("fill","#ffffff").attr("stroke","#000000").attr("stroke-width",5);
 //svg.append("line").attr("x1", graph_base).attr("x2", graph_base+graph_width).attr("y1", graph_height*0.1).attr("y2",graph_height*0.1).attr("stroke","#ff0055").attr("stroke-width",2);
	document.getElementById("results").innerHTML = "あなたの成績　勝ち:0回、負け:0回、あいこ:0回";

    /* 勝敗表示を消す */
	resultTimeline.add({
		targets: '#win',
		duration: 1,
		opacity: 0,
		easing: 'easeInOutQuart'
	});
    /* マシンの手をもどす */
	resultTimeline.add({
		targets: '.m_rock_copy, .m_scissors_copy, .m_paper_copy',
		translateY: 0,
		translateX:0,
		scale: 1,
		duration: 1,
		easing: 'easeInOutQuart'
	});
	/* プレイヤーの出した手を戻す */
	resultTimeline.add({
		targets: '.rock_copy, .scissors_copy, .paper_copy',
		translateY: 0,
		translateX:0,
		scale: 1,
		duration: 1,
		easing: 'easeInOutQuart'
	});
	var retry = document.getElementById("final_result2")
	retry.style.display = "none";
}

function RPS(plhand) {
	rec_hands += " " + String(plhand);
	var resultTimeline = anime.timeline();
	resultTimeline = ShowResults(plhand,predhand,resultTimeline);
	/* 次の手のパーセプトロン予測を前もって行う */
	var pre=perceptron(plhand);/* predhand　は次の予測手(1,2,3) */
	/* (pre+1)%3+1はパーセプトロンの予測手predに対して勝つ「手」
	pre=1(グー)   :(pre+1)%3+1=3(パー)
	pre=2(チョキ) :(pre+1)%3+1=1(グー)
	pre=3(パー)   :(pre+1)%3+1=2(チョキ)*/
	predhand=(pre+1)%3+1;
}


/*1(グー),2(チョキ),3(パー)を入力すると，前もって決めていた
マシンの手を示します．そして「勝ち，負け，引き分け」を表示．
累積度数も示します．*/
function ShowResults(plhand,predhand,resultTimeline){
    /* 勝敗表示を消す */
	resultTimeline.add({
		targets: '#win',
		duration: 1,
		opacity: 0,
		easing: 'easeInOutQuart'
	});
    /* マシンの手をもどす */
	resultTimeline.add({
		targets: '.m_rock_copy, .m_scissors_copy, .m_paper_copy',
		translateY: 0,
		translateX:0,
		scale: 1,
		duration: 1,
		easing: 'easeInOutQuart'
	});
	/* プレイヤーの出した手を戻す */
	resultTimeline.add({
		targets: '.rock_copy, .scissors_copy, .paper_copy',
		translateY: 0,
		translateX:0,
		scale: 1,
		duration: 1,
		easing: 'easeInOutQuart'
	});
	/* プレイヤーの選択した手を表示する */
	var trY=108;
	var trX=140;
	switch(plhand){
	case 1:
		resultTimeline.add({
			targets: '.rock_copy',
			translateX:trX,
			translateY: -trY,
			scale: 2,
			duration: 100,
			easing: 'easeInOutQuart'
		});
		break;
	case 2:
		resultTimeline.add({
			targets: '.scissors_copy',
			translateY: -trY,
			scale: 2,
			duration: 100,
			easing: 'easeInOutQuart'
		});
		break;
	case 3:
		resultTimeline.add({
			targets: '.paper_copy',
			translateX:-trX,
			translateY: -trY,
			scale: 2,
			duration: 100,
			easing: 'easeInOutQuart'
		});
		break;
	}
	// マシンの手を表示
	switch(predhand){
	case 1:
		resultTimeline.add({
			targets: '.m_rock_copy',
			translateY: trY,
			translateX:-trX,
			scale: 2,
			duration: 100,
			offset: '-=100',
			easing: 'easeInOutQuart'
		});
		break;
	case 2:
		resultTimeline.add({
			targets: '.m_scissors_copy',
			translateY: trY,
			scale: 2,
			duration: 100,
			offset: '-=100',
			easing: 'easeInOutQuart'
		});
		break;
	case 3:
		resultTimeline.add({
			targets: '.m_paper_copy',
			translateY: trY,
			translateX:trX,
			scale: 2,
			duration: 100,
			offset: '-=100',
			easing: 'easeInOutQuart'
		});
		break;
	}
	
	/* 勝敗の表示 */
	/* (3+predhand-plhand)%3
	 * 0 : あいこ
	 * 1 : プレイヤーの勝ち
	 * 2 : マシンの勝ち */
	switch((3+predhand-plhand)%3){
		case 0:
			resultTimeline.add({
				targets: '#win',
				duration: 200,
				opacity: 0,
				easing: 'easeInOutQuart'
			});
			results[0][game+1]=results[0][game];
			results[1][game+1]=results[1][game];
			results[2][game+1]=results[2][game]+1;
			break;
		case 1:
			resultTimeline.add({
				targets: '#win',
				offset: '-=100',
				duration: 1,
				translateY:128
			});
			resultTimeline.add({
				targets: '#win',
				offset: '-=100',
				duration: 200,
				opacity: 1,
				easing: 'easeInOutQuart'
			});
			results[0][game+1]=results[0][game]+1;
			results[1][game+1]=results[1][game];
			results[2][game+1]=results[2][game];
			break;
		case 2:
			resultTimeline.add({
				targets: '#win',
				offset: '-=100',
				duration: 1,
				translateY:-16
			});
			resultTimeline.add({
				targets: '#win',
				offset: '-=100',
				duration: 200,
				opacity: 1,
				easing: 'easeInOutQuart'
			});
			results[0][game+1]=results[0][game];
			results[1][game+1]=results[1][game]+1;
			results[2][game+1]=results[2][game];
			break;
	}
	var text="";
	text += "<font color='#6970e9'>勝ち:"+results[0][game+1]+"回</font>、<font color='#e9473f'>負け:"+results[1][game+1]+"回</font>、<font color='#319e34'>あいこ:"+results[2][game+1]+"回</font>";
	document.getElementById("results").innerHTML = text;
	
	var Ymax = 0;
	for(var i=0;i<3;i++){
		if(Ymax<results[i][game+1]){
			Ymax=results[i][game+1];
		}
	}
	
	var wrap = d3.select('#graph');
	wrap.select("svg").remove(); // initialization
	var svg = wrap.append("svg").attr("width",graph_base+graph_width).attr("height",graph_height);
	var points=new Array();
	points[0]=new Array();	//勝ち
	points[1]=new Array();	//負け
	points[2]=new Array();	//あいこ
	for(var i=0;i<3;i++){
		for(var j=0;j<game+2;j++){
			points[i][j]=new Array();
			points[i][j][0]=graph_base+graph_width*0.9/(game+1)*j;
			points[i][j][1]=graph_height-graph_height*0.9/(Ymax)*(results[i][j]);
		}
	}
	svg.append("polyline").attr("points",points[0]).attr("stroke","#00A0E9").attr("stroke-width",8).attr("fill","none");
	svg.append("polyline").attr("points",points[1]).attr("stroke","#E60012").attr("stroke-width",8).attr("fill","none");
	svg.append("polyline").attr("points",points[2]).attr("stroke","#ffD700").attr("stroke-width",8).attr("fill","none");
    if(graph_height-10>graph_height*0.9/Ymax*Match){
        svg.append("line").attr("x1", graph_base).attr("x2", graph_base+graph_width).attr("y1", graph_height-graph_height*0.9/Ymax*Match).attr("y2",graph_height-graph_height*0.9/Ymax*Match).attr("stroke","#ff0055").attr("stroke-width",2);
    }
    svg.append("rect").attr("x", graph_base).attr("y", 0).attr("width", graph_width).attr("height", graph_height).attr("fill","none").attr("stroke","#000000").attr("stroke-width",5);
    // ラベル
    svg.append("line").attr("x1", graph_base+graph_width*0.1).attr("x2", graph_base+graph_width*0.3).attr("y1", graph_height*0.2).attr("y2",graph_height*0.2).attr("stroke","#00A0E9").attr("stroke-width",8);
    svg.append("text").text("あなたの勝ち").attr("x",graph_base+graph_width*0.3+10).attr("y",graph_height*0.2).attr({'dy': ".35em", 'fill': "black" });
    svg.append("line").attr("x1", graph_base+graph_width*0.1).attr("x2", graph_base+graph_width*0.3).attr("y1", graph_height*0.2+20).attr("y2",graph_height*0.2+20).attr("stroke","#E60012").attr("stroke-width",8);
    svg.append("text").text("マシンの勝ち").attr("x",graph_base+graph_width*0.3+10).attr("y",graph_height*0.2+20).attr({'dy': ".35em", 'fill': "black" });
    svg.append("line").attr("x1", graph_base+graph_width*0.1).attr("x2", graph_base+graph_width*0.3).attr("y1", graph_height*0.2+40).attr("y2",graph_height*0.2+40).attr("stroke","#ffD700").attr("stroke-width",8);
    svg.append("text").text("　　あいこ　").attr("x",graph_base+graph_width*0.3+10).attr("y",graph_height*0.2+40).attr({'dy': ".35em", 'fill': "black" });
    for(var i=0;i<=Math.ceil(Ymax/10);i++){
        svg.append("text").text(String(i*10)).attr("x",graph_base-20).attr("y",graph_height-10-graph_height*0.9/Ymax*10*i).attr({'dy': ".35em", 'fill': "black" });
    }
	game++;
	if(results[0][game]>=Match){
		// fin_weightを更新
		var prec=[];
		for(var i=0;i<3;i++) prec[i]=-1;
		prec[plhand-1] = 1;

		/* 各予測ユニットの入力と相手の新しい手のコードの符号が
		一致していない場合に誤り訂正学習を行う */
		for(var i=0;i<3;i++){
			if(prec[i]*pred[i] <= 0){
				for(var j=0;j<3;j++){
					for(var k=0;k<N;k++){
						weight[i][j][k] += prec[i]*record[j][k];
						fin_weight += weight[i][j][k] + " ";
					}
				}
			}
		}
		Youwin(results[0][game],results[1][game]);
	}else if(results[1][game]>=Match){
		// fin_weightを更新
		var prec=[];
		for(var i=0;i<3;i++) prec[i]=-1;
		prec[plhand-1] = 1;

		/* 各予測ユニットの入力と相手の新しい手のコードの符号が
		一致していない場合に誤り訂正学習を行う */
		for(var i=0;i<3;i++){
			if(prec[i]*pred[i] <= 0){
				for(var j=0;j<3;j++){
					for(var k=0;k<N;k++){
						weight[i][j][k] += prec[i]*record[j][k];
						fin_weight += weight[i][j][k] + " ";
					}
				}
			}
		}
		Youlose(results[0][game],results[1][game]);
	}
    return(resultTimeline);
}

function perceptron(player){
	/*　過去のデータrecordにもとづいてweightをかけた入力predの最大値をとる
	予想ユニットの番号（1(グー),2(チョキ),3(パー)）を返す．*/
	/* 前回の相手プレイヤーの手 player=1,2,3 のバイナリー表現：
	グー　(m=1)：prec={+1,-1,-1}
	チョキ(m=2)：prec={-1,+1,-1}
	パー　(m=3)：prec={-1,-1,+1} */
	var prec=[];
	for(var i=0;i<3;i++) prec[i]=-1;
	prec[player-1] = 1;

	/* 各予測ユニットの入力と相手の新しい手のコードの符号が
	一致していない場合に誤り訂正学習を行う */
	for(var i=0;i<3;i++){
		if(prec[i]*pred[i] <= 0){
			for(var j=0;j<3;j++){
				for(var k=0;k<N;k++){
					weight[i][j][k] += prec[i]*record[j][k];
				}
			}
		}
	}
	/* 前回の相手プレイヤーの手{prec[0], prec[1], prec[2]} を
	入力スロット最前列{x[0],x[1],x[2]}に挿入　
	押し出された最後のデータは捨てる*/
	for(var i=0;i<3;i++){
		record[i].unshift(prec[i]);
		record[i].pop();
	}

	/* 予測ユニットへの入力信号の算定 */
	for(var i=0;i<3;i++) pred[i]=0;
	for(var i=0;i<3;i++){
		for(var j=0;j<3;j++){
			for(var k=0;k<N;k++){
				pred[i] += weight[i][j][k]*record[j][k];
			}
		}
	}
	/* 最大入力を受けたユニットの番号（から１を引いたもの） */
	var maxval=pred[0];
	var maxnum = 0;
	for(var i=1;i<3;i++){
		if(pred[i]>=maxval){
			maxval = pred[i];
			maxnum = i;
		}
	}
	/* 最大入力を受けた予測ユニットの番号（１，２，３）を返す */
	return(maxnum+1);
}

function Youwin(win,lose){
	document.getElementById("final_result").innerHTML = '<img src="youwon.png">';
	document.getElementById("final_result3").innerHTML = 'あなたのIQは'+ (110 + (win-lose)*2) +'くらいかな？';
	var retry = document.getElementById("final_result2")
	retry.style.display = "inline";
	var iq = document.getElementById("final_result3")
	iq.style.display = "inline";
	var resultTimeline = anime.timeline();
	resultTimeline.add({
		targets: '#final_result2',
		opacity:0.0,
		duration: 0,
		translateX:0
	});
	resultTimeline.add({
		translateY: -80,
		targets: '#final_result3',
		opacity:0.0,
		duration: 0,
		translateX:0
	});
	resultTimeline.add({
		targets: '#final_result',
		translateY: 0,
		translateX:0,
		scale: 3,
		opacity:0.0,
		duration: 1,
		easing: 'easeInOutQuart'
	});
	resultTimeline.add({
		targets: '#final_result',
		scale: 1,
		opacity:1.0,
		duration: 1500,
		easing: 'easeInOutQuart'
	});
	resultTimeline.add({
		targets: '#final_result2, #final_result3',
		opacity:1.0,
		duration: 1000,
		easing: 'easeInOutQuart'
	});
	send_php();
}

function Youlose(win,lose){
	document.getElementById("final_result").innerHTML = '<img src="youvelost.png">';
	document.getElementById("final_result3").innerHTML = 'あなたのIQは'+ (110 + (win-lose)*2) +'くらいかな？';
	var retry = document.getElementById("final_result2")
	retry.style.display = "inline";
	var iq = document.getElementById("final_result3")
	iq.style.display = "inline";
	var resultTimeline = anime.timeline();
	resultTimeline.add({
		targets: '#final_result2',
		opacity:0.0,
		duration: 0,
		translateX:0
	});
	resultTimeline.add({
		translateY: -80,
		targets: '#final_result3',
		opacity:0.0,
		duration: 0,
		translateX:0
	});
	resultTimeline.add({
		targets: '#final_result',
		translateY: 0,
		translateX:0,
		scale: 3,
		opacity:0.0,
		duration: 1,
		easing: 'easeInOutQuart'
	});
	resultTimeline.add({
		targets: '#final_result',
		scale: 1,
		opacity:1.0,
		duration: 1500,
		easing: 'easeInOutQuart'
	});
	resultTimeline.add({
		targets: '#final_result2, #final_result, #final_result3',
		opacity:1.0,
		duration: 1000,
		easing: 'easeInOutQuart'
	});
	send_php();
}

function send_php(){
// phpへの値の受け渡し
	
$.ajax({
	  type: 'POST',
	  url: '../rpsm.php',
	  dataType:'text',
	  data: {
	    name1 : rec_hands,
	    name2 : ini_weight,
	    name3 : fin_weight
	  },
	  success: function(data) {
	    alert("success");
	    //location.href = "./test.php";
	  }
	});
}