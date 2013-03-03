<?php
/**
 * Created by JetBrains PhpStorm.
 * User: klec
 * Date: 23.11.12
 * Time: 21:31
 * To change this template use File | Settings | File Templates.
 *
 */
$this->run("DELETE FROM `core_resource` WHERE `core_resource`.`code` = 'rotate_setup'");
$this->removeAttribute('4', 'rotate_gallery');
$this->removeAttributeGroup('4', '4', 'Rotate Images');
