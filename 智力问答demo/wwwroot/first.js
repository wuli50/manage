// 后台处理好的缓存，通过响应成功时，将缓存的数据传给客户端（浏览器）
// 从本地缓存的cookie中的 键取出对应的值
var petname =  $.cookie('petname');
console.log(petname)

// 如果缓存的用户名存在，那么显示 用户名
// 如果缓存的用户名不存在，那么显示"登录"
if(petname){
    $('#user').find('span').last().text(petname);
}else{
    // 如果未登录，那么点击登录，移除下拉框，并跳转登录页面
	$('#user').find('span').last().text('登录').parent().removeAttr('data-toggle').click(function(){
		location.href = './login.html'
        });  
}
// 点击+加号 如果当前用户名已登录 那么就跳转到提问的页面
//          如果当前用户名没有登录 那么就跳转到登录的页面
$('#ask').click(function(){

    petname?location.href="./ask.html":location.href="./login.html"

    // 上面👆的写法 效果等同下面👇
    // if(petname){
    //     location.href="./ask.html"
    // }else{
    //     location.href="./login.html"
    // }

})



// 退出登录
$('#logout').on('click','a',function(){
	$.get('/user/logout',function(resspondData){
		location.href='/' 
	})
})














// 发送请求 将提问的数据展示出来
// 没有需要请求的数据，可以用get请求 

// 进入后台 
// 判断文件是否存在
// 遍历文件夹里面的文件，一一读取每一个文件数据
// 每读取一个文件 就将数据存放到数组中
// 最后将数组返回给前端

//回到前端
//遍历返回的数组、
//有多少条数据 就创建/拼接 多少容器、并展示出来







