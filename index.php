<? require_once("header.php") ?>

 <script src='/js/index.js'></script>
 <div id="slides">
<? 
   $i = 0;
   foreach($conf as $section => $slides)
    foreach($slides as $slide => $show)
     if($show) { ?>
  <div id="slide<?=$i?>">
   <a href="/photo/<?=$section?>" title="<?=ucfirst($section)?>"><img src="/photos/<?=$section?>/slides/<?=$slide?>"></a>
  </div>
<?    
      $i ++; 
     }?>      
 </div>    

<? require_once("footer.php") ?>