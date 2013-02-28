<?php
/**
 * Created by JetBrains PhpStorm.
 * User: klec
 * Date: 25.01.12
 * Time: 19:23
 * To change this template use File | Settings | File Templates.
 */
class Klec_Rotate_Model_Setup extends Mage_Eav_Model_Entity_Setup
{

    public function addRotateTab()
    {
        $imageTab=  $this->getAttributeGroup('4', '4', 'Images');
        $this->addAttributeGroup('4', '4', 'Rotate Images',$imageTab['sort_order']);
    }

    function addMediaGallery()
    {
        $attr = array(
//            'backend' => 'rotate/media',
            'backend' => 'catalog/product_attribute_backend_media',
            'type' => 'varchar',
            'input' => 'rotate',
            'label' => 'Rotate gallery',
            'source' => 'eav/entity_attribute_source_boolean',
            'required' => 0,
            'user_defined' => 0
        );
        $this->addAttribute('4', 'rotate_gallery', $attr);
        if ($groupId = $this->getAttributeGroupId('4', '4', 'Rotate Images')) {
            $this->addAttributeToGroup('4', '4', $groupId, $this->getAttributeId('4', 'rotate_gallery'));
        }
    }
}