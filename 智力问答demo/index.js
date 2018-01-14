var express = require('express');
var bodyParser = require('body-parser');
// 缓存数据
var cookieParser = require('cookie-parser');
var fs = require('fs'); 
var app = express(); 
app.use(express.static('wwwroot'))
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
var multer = require('multer');
// 配置储存上传文件的 storage
var storage = multer.diskStorage({
    // 图片文件夹存储路径
	destination: 'wwwroot/Photos',
    // 文件名称
	filename: function(req,res,callback){
		var petname = req.cookies.petname;
		callback(null,petname + '.jpg')
	}
}); 
var upload = multer({storage});

/*******************7 推出登陆*********************/
app.get('/user/logout',function(req,res){

   // 从后台往前端发送的缓存键值对，可以在浏览器上查看到
	// res.cookie('key','name')
	// 获取前端请求时带有的缓存
	// req.cookies.petname

	// 清除当前用户
	res.clearCookie('petname');
	res.status(200).json({
		code:1,
		message:'已经退出'
	}) 
})    


/*******************6 上传头像*********************/
app.post('/user/photo',upload.single('photo'),function(req,res){
        res.status(200).json({
            code:1,
            message:'大头贴已上传，赶紧去查看吧。。。'
        })
})

/************ 5 回答 ****************/
app.post('/question/answer',function(req,res){
    // 用户是否登录
    if(!req.cookies.petname){
        res.status(200).json({
            code:0,
            message:'登录已超时，请重新登录'
        });
    }else{
    // 获取到对应的 存储问题的文件 
    var filename = 'Question/' +req.cookies.questionURL + '.txt';
    fs.readFile(filename,function(err,data){
        if(err){
            res.status(200).json({
                code:0,
                message:'读取文件失败---回答'
            });
        }else{
            // console.log(JSON.parse(data))
            // 获取文件中已有的数据
            var object = JSON.parse(data); 
            if(!object.answers){
                // 向对象添加新属性，该属性为数组，用来存放回答的数据
                object.answers = [];
            }
            // req.body.content  
            req.body.petname = req.cookies.petname;
            req.body.ip = req.ip;
            req.body.time = new Date();

            // 将数据添加到数组中
            object.answers.push(req.body);
            console.log(object)
            // 把数据写入文件
            fs.writeFile(filename,JSON.stringify(object),function(error){
                if(error){
                    res.status(200).json({
                        code:0,
                        message:'写入文件失败---回答'
                    });
                }else{
                    res.status(200).json({
                        code:1,
                        message:'已回答成功！！'
                    });
                }
            })
        }
    }) 
    // 将表单上传的数据写入文件中 
    // 写入成功后返回首页，展示回答的数据
    }
})

/************ 4 首页数据展示 ****************/
app.get('/question/all',function(req,res){
    // 读取文件夹/目录
    fs.readdir('Question',function(error,files){
        if(error){
            res.status(200).json({
                code:0,
                message:'读取Question文件夹失败'
            });
        }else{
            
            // files文件夹里面的所有文件
            // console.log(files)
            
            // 按逆序排列数组，以最新的时间来排序
            files = files.reverse()  

            // 有多少个文件，就读多少次数据，存储到大数组中questionsAry
            var questionsAry = [];
            for(var i = 0;i<files.length;i++){
                var filename = 'Question/' + files[i];
                // 读取文件（为了避免乱序，使用同步的读取方式）
                // fs.readFile() 异步读取文件
                // fs.readFileSync() 同步读取文件
                var data = fs.readFileSync(filename);
                data = JSON.parse(data);
                // 将数据添加到数组中
                questionsAry.push(data);
            }
             // 将存有数据的大数组返回给客户端
            res.status(200).json(questionsAry);
        }
    })
})



/************ 3 提问 ****************/
app.post('/user/ask',function(req,res){
    //1 判断用户是否登录过
     console.log('当前登录的用户：'+ req.cookies.petname);
    if(!req.cookies.petname){
        res.status(200).json({
            code:0,
            message:'你还没有登陆，先去登陆吧。。。'
        });
    }else{
         // 2 用户已登录 且点击提交提问  将提问的数据存储起来
         fs.exists('Question',function(exist){
             if(exist){
                //  将数据写入文件
                writeQuestion();
             }else{
                //  创建文件
                fs.mkdir('Question',function(error){
                    if(error){
                        // 创建文件失败
                        res.status(200).json({
                            code:0,
                            message:'创建Question文件夹失败'
                        });
                    }else{
                        // 如果创建成功 将数据写入文件
                        writeQuestion();
                    }
                })
             }
         })
    }
    // 封装一个文件 将问题写入文件
    function writeQuestion(){
        var now = new Date();     
        // 文件路径
        var filename = 'Question/' + now.getTime() +'.txt';
        // 请求的时间
        req.body.time = now;
        // 请求的ip地址
        req.body.ip = req.ip;
        // 请求的用户名
        req.body.petname = req.cookies.petname;
        // req.body.content
        fs.writeFile(filename,JSON.stringify(req.body),function(error){
            if(error){
                res.status(200).json({
                    code:0,
                    message:'写入Question文件失败'
                });
            }else{
                res.status(200).json({
                    code:1,
                    message:'提问成功'
                });
            }
        })
    }
})

/************ 2 登录 ****************/
app.post('/user/login',function(req,res){

    // 用户是否存在，如果不存在就无法登录，提示用户去注册
    // 如果存在，判断用户对应的密码是否正确
    // 如果不正确 提示密码错误 登录失败
    // 如果正确 提示登录成功

    // 根据用户名的文件路径是否存在，判断用户名是否注册过
     var filename = 'Users/' + req.body.petname + '.txt';
     
     fs.exists(filename,function(exist){
         if(exist){
            //  用户注册过，判断密码
            fs.readFile(filename,function(error,fileData){
                if(error){
                    // 读取文件失败
                    res.status(200).json({
                        code:0,
                        message:'读取用户文件失败！'
                    });
                }else{
                    // 获取出来的文件数据fileData是一个数据流Buffer
                    // 所以需要将数据流转化为对象的格式，才能获取对象的属性
                    var pwd = JSON.parse(fileData);
                    // 获取表单输入的密码 判断与文件中存储的密码是否一致
                   if( req.body.password ==  pwd.password){
                        //获取有效的缓存时间
                        var time = new Date(); 
                        time.setSeconds(time.getSeconds()+250000);
                        res.cookie('petname',req.body.petname,{expires:time});
                        res.status(200).json({
                            code:1,
                            message:'登录成功'
                        });
                   }else{
                        res.status(200).json({
                            code:0,
                            message:'密码错误，登录失败！'
                        });
                   } 
                }
            })
         }else{
            //  用户不存在 不能登录
            res.status(200).json({
                code:0,
                message:'用户不存在，赶紧去注册吧 ~'
            });
         }
     })
})


/************ 1 注册 ****************/
app.post('/user/register',function(req,res){
    console.log('请求已经连接服务器。。。。');
    // 将注册的用户数据存储起来，写入文件 Users
    fs.exists('Users',function(exist){
        if(exist){
            // 将数据写入文件夹中
            writeFile(req.body.petname);
        }else{
            // 如果文件夹不存在 创建文件夹
            fs.mkdir('Users',function(error){
                if(error){
                    // 如果错误对象存在，说明创建文件夹的操作失败
                    res.status(200).json({
                        code:0,
                        message:'创建文件夹失败'
                    });
                }else{
                    // 如果错误对象不存在，说明创建文件夹的操作 成功
                    // 将数据写入文件夹中
                    writeFile(req.body.petname);
                }
            })
        }
    });

    // 封装一个函数  将数据写入文件夹中
    function writeFile(petname){
        // 文件路径
        var filename = 'Users/'+petname + '.txt';
        // 判断文件是否存在，如果存在，用户名已经被注册过了，如果不存在，用户名可以用
        fs.exists(filename,function(exist){
            if(exist){
                // 提示该用户已经注册过了
                res.status(200).json({
                    code:0,
                    message:"该用户已经注册过了"
                });
            }else{
                // 将文件写入 并返回提示 注册成功
                fs.writeFile(filename,JSON.stringify(req.body),function(error){
                    if(error){
                        res.status(200).json({
                            code:0,
                            message:"用户数据写入失败"
                        });
                    }else{
                        res.status(200).json({
                            code:1,
                            message:"注册成功！"
                        });
                    }
                })
            }
        });
    }
})


app.listen(3000,function(){
    console.log('服务器已经开启了。。。');
})