<?php
    if (isset($_POST["name1"])) {
        $rec_hands = $_POST['name1'];
    } else {
        echo "値が入力されていません";
    }
    if (isset($_POST["name2"])) {
        $ini_weight = $_POST['name2'];
    } else {
        echo "値が入力されていません";
    }
    $file = "rpsm.csv";
    file_put_contents($file, $ini_weight, FILE_APPEND);
    file_put_contents($file, ",", FILE_APPEND);
    file_put_contents($file, $rec_hands, FILE_APPEND);
    file_put_contents($file, "\n", FILE_APPEND);
    ?>
