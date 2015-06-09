<?
$config = json_decode(file_get_contents('./config.json'), true);
if(($_SERVER['PHP_AUTH_USER'] != $config['auth']['username']) or ($_SERVER['PHP_AUTH_PW'] != $config['auth']['password'])) {
 header('WWW-Authenticate: Basic realm="hi!"');
 header('HTTP/1.0 401 Unauthorized');
 echo 'Access denied';
 return;
}

 require_once('./conf.php');
 if(count($_FILES)) {
  foreach($_FILES as $file) {
   if(!in_array($_POST['section'], array_keys($conf)))
    return;
   $thumbWidth = 56;
   $thumbHeight = 56;
   $maxWidth = 675;
   $maxHeight = 450;
   $name = uniqid('auto') . '.jpg';
   $filename = $file['tmp_name'];
   list($width, $height) = getimagesize($filename);
   if(!$width or !$height)
    return;
   $thumb = imagecreatetruecolor($thumbWidth, $thumbHeight);
   $source = @imagecreatefromjpeg($filename);
   if(!$source)
    return;
   $ratioWidth = $width / $maxWidth;
   $ratioHeight = $height / $maxHeight;
   if(($ratioWidth > 1.) or ($ratioHeight > 1.)) { 
    $ratio = max($ratioWidth, $ratioHeight);
    $targetWidth = $width / $ratio;
    $targetHeight = $height / $ratio;
    $target = imagecreatetruecolor($targetWidth, $targetHeight);
    imagecopyresampled($target, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);
    $source = $target;
    $width = $targetWidth;
    $height = $targetHeight;
   }
   $x = 0;
   $y = 0;
   $size = min($width, $height);
   $offset = abs($width - $height) / 2.;
   if($width > $height)
    $x += $offset;
   else
    $y += $offset;
   imagecopyresampled($thumb, $source, 0, 0, $x, $y, $thumbWidth, $thumbHeight, $size, $size);
   imagejpeg($thumb, './photos/' . $_POST['section'] . '/thumbs/' . $name, 100);
   imagejpeg($source, './photos/' . $_POST['section'] . '/slides/' . $name, 100);
   if(is_uploaded_file($file['tmp_name']))
    unlink($file['tmp_name']);
   header("Content-Type: application/json");
   echo json_encode(array('file' => $name));
   return;
  }
 }

 if($_POST['action'] == 'save') {
   file_put_contents('./photos/conf.json', $_POST['conf']);
   return;
 }

 if($_POST['action'] == 'delete') {
  $file = basename($_POST['file']);
  if(!in_array($_POST['section'], array_keys($conf)))
   return;
  $slide = './photos/' . $_POST['section'] . '/slides/' . $file;
  if(file_exists($slide))
   unlink($slide);
  $thumb = './photos/' . $_POST['section'] . '/thumbs/' . $file;
  if(file_exists($thumb))
   unlink($thumb);
  return;
 }  
?>


<!DOCTYPE html>
<html>
 <head>
  <title>Photographer Stebeneva Mariana</title>
  <meta charset="utf-8"> 

  <link href="/css/bootstrap.css" rel="stylesheet" type="text/css">
  <link href="/css/default.css" rel="stylesheet" type="text/css">
  <link href="/css/admin.css" rel="stylesheet" type="text/css">

  <script src="/js/jquery.js" type="text/javascript"></script>
  <script src="/js/jquery.ui.js" type="text/javascript"></script>
  <script src="/js/bootstrap.js" type="text/javascript"></script>
  <script src="/js/default.js" type="text/javascript"></script>
  <script src="/js/admin.js" type="text/javascript"></script>
  <script>  
   var conf = <?=json_encode($conf)?>;
  </script>
 </head>
 <body>
  <div class="modal hide" id="slide">
   <div class="modal-body">
    <button type="button" class="close" data-dismiss="modal">×</button>
    <img>
   </div>
   <div class="modal-footer">
    <label class="checkbox inline pull-left">
     <input type="checkbox"> Show on frontpage
    </label>
    <a class="btn btn-danger delete">Delete</a>
   </div>
  </div>
  <ul class="nav nav-pills"></ul>
  <div class="slides tab-content"></div>
 </body>
</html>
