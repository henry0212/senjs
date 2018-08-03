/// <reference path="../js/dh/colors.js" />
/// <reference path="../js/dh/control.js" />
/// <reference path="../js/control.js" />

var st_edittext = [
      {
          dhKey: dhStyle.padding_bottom,
          dhValue: "5px"
      },
       {
           dhKey: dhStyle.padding_top,
           dhValue: "5px"
       },
       {
           dhKey: dhStyle.border,
           dhValue: "1px solid " + dhStyleValue.colors.gray
       },
       {
           dhKey: dhStyle.border_radius,
           dhValue: "5px"
       },
       {
           dhKey: dhStyle.font_size,
           dhValue: function () {
               return dhSize.button.textSize_large + "px";
           }
       }
]

var st_textview = [
      {
          dhKey: dhStyle.padding_bottom,
          dhValue: "2px"
      },
       {
           dhKey: dhStyle.padding_top,
           dhValue: "2px"
       },
       {
           dhKey: dhStyle.font_size,
           dhValue: function () {
               return dhSize.button.textSize_large + "px";
           }
       }
]


var st_button = [
     {
         dhKey: dhStyle.font_size,
         dhValue: function () {
             return dhSize.button.textSize_large + "px";
         }
     },
    {
        dhKey: dhStyle.font_weight,
        dhValue: dhStyleValue.font.bold
    }
]

var st_button_border = [
     {
         dhKey: dhStyle.font_size,
         dhValue: function () {
             return dhSize.button.textSize_large + "px";
         }
     },
    {
        dhKey: dhStyle.font_weight,
        dhValue: dhStyleValue.font.bold
    },
    {
        dhKey: dhStyle.background_color,
        dhValue: dhStyleValue.colors.white
    },
    {
        dhKey: dhStyle.border,
        dhValue: "1px solid " + dhStyleValue.colors.black
    },
      {
          dhKey: dhStyle.padding,
          dhValue: "6px 0px 6px 0px"
      },
      {
          dhKey: dhStyle.border_radius,
          dhValue: "5px"
      }



]

var st_main_dashboard = [
     {
         dhKey: dhStyle.width,
         dhValue: "40%"
     },
     {
         dhKey: dhStyle.padding_left,
         dhValue: "30%"
     },
       {
           dhKey: dhStyle.padding_right,
           dhValue: "30%"
       },
      {
          dhKey: dhStyle.position,
          dhValue: dhStyleValue.position.fixed,
      },
     {
         dhKey: dhStyle.top,
         dhValue: "15%"
     },
          {
              dhKey: dhStyle.left,
              dhValue: "0px"
          },



]

var st_main_dashboard_button_function = [
     {
         dhKey: dhStyle.width,
         dhValue: function () {
             return info.SCREEN_HEIGHT * 0.2 + "px";
         },
     },
     {
         dhKey: dhStyle.height,
         dhValue: function () {
             return info.SCREEN_HEIGHT * 0.2 + "px";
         },
     },
     {
         dhKey: dhStyle.text_color,
         dhValue: dhStyleValue.colors.black,
     }
]

var st_ooproduct_action_bottom_button = [
     {
         dhKey: dhStyle.width,
         dhValue: "17%"
     },
     {
         dhKey: dhStyle.height,
         dhValue: function () {
             return info.SCREEN_HEIGHT * 0.1 + "px";
         },
     },
]

var st_ooproduct_button_category_item = [
    {
        dhKey: dhStyle.width,
        dhValue: "88%"
    },
     {
         dhKey: dhStyle.height,
         dhValue: "auto"
     },
     {
         dhKey: dhStyle.padding,
         dhValue: "8px 6% 8px 6%"
     },
     {
         dhKey: dhStyle.background_repeat,
         dhValue: "no-repeat"
     },
     {
         dhKey: dhStyle.background_position,
         dhValue: dhStyleValue.background_postition.middle_left
     },
     {
         dhKey: dhStyle.background_size,
         dhValue: "5% auto"
     },
     {
         dhKey: dhStyle.font_size,
         dhValue: function () {
             return dhSize.button.textSize_large + "px"
         }
     }
]

var st_ooproduct_panel_product_list = [
   {
       dhKey: dhStyle.background,
       dhValue: "rgba(255,255,255,0.8)"
   }
]


var st_ooproduct_panel_product_detail = [
   {
       dhKey: dhStyle.background,
       dhValue: "rgba(255,255,255,0.9)"
   }
]



var st_ooproduct_button_product_item = [
    {
        dhKey: dhStyle.width,
        dhValue: "82%"
    },
     {
         dhKey: dhStyle.height,
         dhValue: "auto"
     },
     {
         dhKey: dhStyle.padding,
         dhValue: "8px 3% 8px 3%"
     },
     {
         dhKey: dhStyle.text_align,
         dhValue: "left"
     },
    {
        dhKey: dhStyle.font_size,
        dhValue: function () {
            return dhSize.button.textSize_large + "px";
        }
    },
]


var st_ooproduct_button_product_item_label_product_name = [

    {
        dhKey: dhStyle.font_size,
        dhValue: function () {
            return dhSize.textView.textSize + "px";
        }
    },

]


var st_ooproduct_button_product_item_label_code = [
    {
        dhKey: dhStyle.width,
        dhValue: "auto"
    },
     {
         dhKey: dhStyle.height,
         dhValue: "auto"
     },
     {
         dhKey: dhStyle.padding,
         dhValue: "2px 5px"
     },
     {
         dhKey: dhStyle.text_align,
         dhValue: "left"
     },
    {
        dhKey: dhStyle.font_size,
        dhValue: function () {
            return dhSize.button.textSize_small + "px";
        }
    },

]



var st_ooproduct_detail_title_column = [
    {
        dhKey: dhStyle.font_size,
        dhValue: function () {
            return dhSize.button.textSize_large + "px";
        }
    }
]

var st_ooproduct_detail_edittext = [
     {
         dhKey: dhStyle.padding_bottom,
         dhValue: "5px"
     },
       {
           dhKey: dhStyle.padding_top,
           dhValue: "5px"
       },
       {
           dhKey: dhStyle.border,
           dhValue: "1px solid " + dhStyleValue.colors.gray
       },
       {
           dhKey: dhStyle.border_radius,
           dhValue: "5px"
       },
        {
            dhKey: dhStyle.width,
            dhValue: "100%"
        },
        {
            dhKey: dhStyle.margin_bottom,
            dhValue: "10px"
        },
        {
            dhKey: dhStyle.margin_top,
            dhValue: "10px"
        },
       {
           dhKey: dhStyle.font_size,
           dhValue: function () {
               return dhSize.button.textSize_large + "px";
           }
       }
]

var st_oopopup = [
     {
         dhKey: dhStyle.background_color,
         dhValue: dhStyleValue.colors.white
     },
]

var st_oopopup_bottom_button = [
    {
        dhKey: dhStyle.font_weight,
        dhValue: dhStyleValue.font.bold
    },
     {
         dhKey: dhStyle.float,
         dhValue: dhStyleValue.float.right
     },
       {
           dhKey: dhStyle.width,
           dhValue: "25%",
       },
     {
         dhKey: dhStyle.height,
         dhValue: "auto"
     },
      {
          dhKey: dhStyle.padding_top,
          dhValue: "5px"
      },
      {
          dhKey: dhStyle.padding_bottom,
          dhValue: "5px"
      },
]

var st_oopopup_title_column = [
    {
        dhKey: dhStyle.font_size,
        dhValue: function () {
            return dhSize.button.textSize_small + "px";
        }
    }
]

var st_oopopup_copy_product_expander_header = [
     {
         dhKey: dhStyle.font_size,
         dhValue: function () {
             return dhSize.button.textSize_large + "px";
         }
     },
     {
         dhKey: dhStyle.text_color,
         dhValue: dhStyleValue.colors.black
     },
     {
         dhKey: dhStyle.margin,
         dhValue: "8px 5% 8px 10%"
     }
]


var st_oopopup_copy_product_button = [
     {
         dhKey: dhStyle.width,
         dhValue: "100%"
     },
      {
          dhKey: dhStyle.border,
          dhValue: "1px solid #888"
      },
     {
         dhKey: dhStyle.height,
         dhValue: function () {
             return info.SCREEN_HEIGHT * 0.15 + "px";
         },
     },
     {
         dhKey: dhStyle.text_color,
         dhValue: dhStyleValue.colors.black,
     }
]


var st_oopopup_lock_button = [
     {
         dhKey: dhStyle.width,
         dhValue: "50%"
     },
     {
         dhKey: dhStyle.height,
         dhValue: function () {
             return info.SCREEN_HEIGHT * 0.2 + "px";
         },
     },
     {
         dhKey: dhStyle.text_color,
         dhValue: dhStyleValue.colors.black,
     },

]

var st_oosales_category_button = [
      //{
      //    dhKey: dhStyle.width,
      //    dhValue: function () {
      //        return info.SCREEN_WIDTH * 0.1 + "px";
      //    },
      //},
     {
         dhKey: dhStyle.padding,
         dhValue: "8px 10px 8px 10px"
     },
     {
         dhKey: dhStyle.text_color,
         dhValue: dhStyleValue.colors.black,
     },
      {
          dhKey: dhStyle.font_size,
          dhValue: function () {
              return dhSize.button.textSize_large + "px"
          }
      }
]

var st_oosale_txt_search = [
    {
        dhKey: dhStyle.font_size,
        dhValue: function () {
            return dhSize.button.textSize_larger + "px"
        }
    },
    {
        dhKey: dhStyle.shadow,
        dhValue: "none"
    },
     {
         dhKey: dhStyle.border,
         dhValue: "0px solid #000000"
     },
      {
          dhKey: dhStyle.background_color,
          dhValue: dhStyleValue.colors.white
      }
]

var st_oosale_product_button = [
     {
         dhKey: dhStyle.font_size,
         dhValue: function () {
             return dhSize.button.textSize + "px"
         }
     },
     {
         dhKey: dhStyle.background_color,
         dhValue: dhStyleValue.colors.white
     },

]

var st_oosale_order_title = [
     {
         dhKey: dhStyle.font_size,
         dhValue: function () {
             return (dhSize.textView.textSize_larger + 4) + "px"
         }
     },
]



var st_oosale_txt_info = [
     {
         dhKey: dhStyle.font_size,
         dhValue: function () {
             return dhSize.textView.textSize + "px"
         }
     },
       {
           dhKey: dhStyle.font_weight,
           dhValue: dhStyleValue.font.bold
       },
     {
         dhKey: dhStyle.width,
         dhValue: "96%",
     },
     {
         dhKey: dhStyle.margin,
         dhValue: "auto 2% auto 2%"
     }
]


var st_oosale_button_info = [
     {
         dhKey: dhStyle.font_size,
         dhValue: function () {
             return dhSize.textView.textSize + "px"
         }
     },
     {
         dhKey: dhStyle.font_weight,
         dhValue: dhStyleValue.font.bold
     },
    {
        dhKey: dhStyle.width,
        dhValue: "93%",
    },
    {
        dhKey: dhStyle.margin,
        dhValue: "auto 5% auto 5%"
    },

    {
        dhKey: dhStyle.border_radius,
        dhValue: "0px"
    },
     {
         dhKey: dhStyle.border,
         dhValue: function () {
             return "1px solid " + posColors.border_button;
         }
     },
      {
          dhKey: dhStyle.background_color,
          dhValue: dhStyleValue.colors.transparent
      },
       {
           dhKey: dhStyle.padding,
           dhValue: "6px 0px 6px 0px"
       },
       {
           dhKey: dhStyle.border_radius,
           dhValue: "5px"
       }

]

var st_oosale_button_action = [
     {
         dhKey: dhStyle.font_size,
         dhValue: function () {
             return dhSize.textView.textSize + "px"
         }
     },
     {
         dhKey: dhStyle.font_weight,
         dhValue: dhStyleValue.font.bold
     },
    {
        dhKey: dhStyle.width,
        dhValue: "96%",
    },
    {
        dhKey: dhStyle.margin,
        dhValue: "auto 2% auto 2%"
    },

    {
        dhKey: dhStyle.border_radius,
        dhValue: "0px"
    },
    {
        dhKey: dhStyle.border,
        dhValue: "0px solid #000"
    },
      {
          dhKey: dhStyle.background_color,
          dhValue: function () {
              return ggColors.Blue.g500
          }
      },
      {
          dhKey: dhStyle.text_color,
          dhValue: "#FFFFFF"
      },

      {
          dhKey: dhStyle.border_radius,
          dhValue: "5px"
      },
       {
           dhKey: dhStyle.padding,
           dhValue: "6px 0px 6px 0px"
       }
]

var st_oosale_button_page_number = [
     {
         dhKey: dhStyle.font_size,
         dhValue: function () {
             return dhSize.textView.textSize + "px"
         }
     },
        {
            dhKey: dhStyle.border_radius,
            dhValue: "5px"
        },
      {
          dhKey: dhStyle.background,
          dhValue: "rgba(255,255,255,0.6)"
      }

]

var st_oosale_order_item = [
    {
        dhKey: dhStyle.padding,
        dhValue: "8px 2% 8px 2%"
    },
    {
        dhKey: dhStyle.border_bottom,
        dhValue: "1px solid #888888"
    },
    {
        dhKey: dhStyle.width,
        dhValue: "92%"
    },
    {
        dhKey: dhStyle.margin_left,
        dhValue: "2%"
    }
]

var st_oosale_order_item_txt_name = [
    {
        dhKey: dhStyle.font_weight,
        dhValue: dhStyleValue.font.bold
    },
     {
         dhKey: dhStyle.font_size,
         dhValue: function () {
             return dhSize.textView.textSize_large + "px";
         }
     },
       {
           dhKey: dhStyle.margin_left,
           dhValue: "5px"
       }

]


var st_oosale_order_item_txt_quantity = [
   {
       dhKey: dhStyle.font_weight,
       dhValue: dhStyleValue.font.bold
   },
]


var st_oosale_order_item_txt_price = [
    {
        dhKey: dhStyle.margin_left,
        dhValue: "5px"
    }
]


var st_oosale_order_item_txt_total = [
    {
        dhKey: dhStyle.font_weight,
        dhValue: dhStyleValue.font.bold
    }
]


var st_oosale_order_discount = [
    {
        dhKey: dhStyle.border,
        dhValue: function () {
            return "1px solid " + posColors.border_edittext;
        }
    },
    {
        dhKey: dhStyle.border_radius,
        dhValue: "5px",
    },
    {
        dhKey: dhStyle.font_size,
        dhValue: function () {
            return dhSize.textView.textSize_large + "px";
        }
    },
     {
         dhKey: dhStyle.shadow,
         dhValue: "none"
     },
     {
         dhKey: dhStyle.padding,
         dhValue: "4px 4px"
     }
]


var st_table_ordered = [
        {
            dhKey: dhStyle.border,
            dhValue: function () {
                return "1px solid " + posColors.border_button;
            }
        },
        {
            dhKey: dhStyle.border_radius,
            dhValue: function () {
                return integers.border_radius + "px";
            }
        },
        {
            dhKey: dhStyle.margin_left,
            dhValue: "4px"
        },
         {
             dhKey: dhStyle.background_color,
             dhValue: "#FFFFFF"
         }
]


var integers = {
    border_radius: 5,
    border_width: 1
}

var posColors = {
    border_color: "#90CAF9",
    border_button: "#42A5F5",
    border_edittext: "#90CAF9",
    border_orderdetail: "#BBDEFB"
}

