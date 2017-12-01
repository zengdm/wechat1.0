import xapi from "../../utils/xapi"
export default function drawer(page){
    let root=page;
    // console.log(root)
    var drawerW = root.data.winWidth * 0.8;
    console.log(page);
    Object.assign(root,{
        hideDrawer(){
          console.log('hidehide');
            root.setData(  //mask 
                {  
                showDrawerFlag: false
                }  
            );  
            var animation = wx.createAnimation({  
                duration: 300,   
                timingFunction: "linear",  
                delay: 0 
            });  
            page.animation = animation;  
            animation.translateX(drawerW).step();  
            page.setData({  
                animationData: animation.export()  
            })
        },
        showDw(){

          // 测试drawer调用brand
            var animation = wx.createAnimation({  
                duration: 300,   
                timingFunction: "linear",  
                delay: 0 
            });  
            root.animation = animation;  
            animation.translateX(-drawerW).step();
            root.setData(  //mask 
                { 
                    showDrawerFlag: true,
                    animationData: animation.export()
                }  
            );
        },
        aa:function(){
            console.log('brand调用--------------------------------->drawer');
        },

    })
    this.requestdata = function (data,isback) { 
      root.setData({
        drawerSeriesData:{}
      });
      root.showDw();


        // root.setData({
        //     showBackFlag:isback
        // })
        
        // console.log(data);
        // xapi.request({
        //   url: 'https://car.diandong.com/api/get_chexi_weixin/' + data.pbid,
        //     // data:data,
        //     method:'GET'
        // }).then(function(rs){
        //     var rdata = rs.data;
        //     //that.data.drawerSeriesData = rdata.data.list;
        //     console.log(rdata.data.list);
        //     root.setData({
        //         drawerSeriesData:rdata.data.list
        //     });

        //     // 界面动画，显示抽屉
        //     root.showDw();
        // });
    };


}