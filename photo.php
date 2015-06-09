<? require_once("header.php") ?>

<script src='/js/photo.js'></script>
<div id="main">
 <div id="middle_container">
  <div id="main_image"></div>
 </div>
 <div class="clear"></div> 
  <div id="scroller_container">
   <img class="hide" id="left_arrow" src="/res/left.png" alt="Scroll left" title="Scroll left" />     
   <div id="image_scroller">
    <ul id="thumbnails_container" class="thumbnails_unstyled">

<?php
$i = 0;
foreach($conf[$_GET['s']] as $file => $show) {
 $slide = '/photos/' . $_GET['s'] . '/slides/' . $file;
 $thumb = '/photos/' . $_GET['s'] . '/thumbs/' . $file;
 $class = '';
 if(!$i)
  $class = 'active';
 echo "<li class='$class'><a href='$slide'><img src='$thumb' style='width:56px; height:56px;'></a></li>";
 $i ++;
}
?>   
    </ul>
    <div class="clear"></div>
   </div>     
   <img class="hide" id="right_arrow" src="/res/right.png" alt="Scroll right" title="Scroll right" />   
   <div class="clear"></div>
  </div>
  <div class="clear"></div>
</div>
<div class="clear"></div>

<? require_once("footer.php") ?>