//ドロワーメニュー開閉===========================================================
(function () {

    //ハンバーガーボタンクリック時の関数
    //querySelector：CSSセレクタで要素を取得
    //const $hamburger = document.querySelector('.hamburger');
    //addEventListener：イベント処理（click）
    //$hamburger.addEventListener('click', function(){
      //ON時はis-activeクラス付与、OFF時はis-activeクラス削除
      //$hamburger.classList.toggle('is-active')
    //});
   
    //全体を囲む要素をid[#menu]で指定
    const $wrapper = document.getElementById('menu');
    var $list = $wrapper.classList;
    //メニューオープン・クローズのボタン要素をid[menu-btn]で指定
    const $navBtn = document.getElementById('menu-btn');
   
    //クリックしたら navToggle関数実行
    $navBtn.addEventListener('click', navToggle);
   
    //navToggleの関数
    function navToggle() {
        //開閉ボタンのクラス操作
        $navBtn.classList.toggle('header__menu-btn--is-open');

      //contains:文字列が引数に指定した文字列を含まれているかどうか[menu--is-open]
      if ($wrapper.classList.contains('menu--is-open')) {
        //メニュークローズ時
        navCloseFunc();
      } else {
        //メニューオープン時
        navOpenFunc();
      }
    }
   
    //メニューオープン時の関数
    function navOpenFunc() {
      //wrapperのclass[menu--is-open]付与
      $wrapper.classList.add('menu--is-open');
    }
    //メニュークローズ時の関数
    function navCloseFunc() {
      //wrapperのclass[menu--is-open]削除
      $wrapper.classList.remove('menu--is-open');
    }
   
  })();