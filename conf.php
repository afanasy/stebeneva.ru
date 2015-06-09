<?
 if(file_exists('./photos/conf.json'))
  $conf = json_decode(file_get_contents('./photos/conf.json'), true);
 else {
  foreach(array('studio', 'portrait', 'reportage', 'models', 'travel') as $section)
   foreach(glob("./photos/$section/slides/*") as $slide)
    $conf[$section][basename($slide)] = false;
 }
?>