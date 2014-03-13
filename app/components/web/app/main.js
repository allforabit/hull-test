/*
define({
  //type: 'Hull',
  initialize: function(){
    alert('hello');
    //console.log('start app component');
    //this.html('<h1>Hello Aura</h1>');
  }
});
*/

define({
  templates: ['app'],
  initialize: function() {

    console.log(this);

    /*
    var superbadUid = Hull.util.entity.encode("http://www.imdb.com/title/tt0829482/");
    //"~aHR0cDovL3d3dy5pbWRiLmNvbS90aXRsZS90dDA4Mjk0ODI="

    //Fetch comments on the superbad entity: 
    Hull.api(superbadUid + '/comments', function (comments) {
      console.log(comments);
    });
    */

    this.data = {
      bla: 'bla',
      bla2: 'bla 2'
    };

    this.html('Hello yo {bla} yo {bla2}');

    setTimeout(this.changeData.bind(this), 3000);
    setTimeout(this.changeData2.bind(this), 6000);

  },
  changeData: function(){
    this.data.bla = 'waahhaa wahh';
  },
  changeData2: function(){
    this.data.bla = 'Yo ho ho';
  }
});
