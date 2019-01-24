(function() {
  /**
	@基于jQuery滚动条插件
	@修改css来实现需要的效果。
	@页面可出现多个类似插件，只要复制dom结构到对应位置即可。
	@杨永
	@QQ:377746756
	@call:18911082352
	@版本:1.0
	*/
  function PZScrollbar(object) {
    var _this_ = this;
    //保存传递将来的对象
    this.scrollObject = object;
    //获取方向属性
    this.dir = this.scrollObject.attr('data-dir');
    //保存滚动对象
    this.scrollContent = $('.scroll-content', object);
    //保存滑动条轨道
    this.scrollTrack = $('.scrollbar-track', object);
    //获取滚动内容于于可视区域的比例
    this.beishu = {
      mx:
        $('.scroll-content', object).width() /
        $('.scrollbar-area', object).width(),
      my:
        $('.scroll-content', object).height() /
        $('.scrollbar-area', object).height()
    };
    //保存拖动句柄
    this.scrollHandle = $('.scrollbar-handle', object);
    //设置滑块的尺寸
    this.setScrollHandleSize();
    //保存拖动句柄的父节点相对页面的偏移,尺寸
    this.scrollHandleAreaPos = {
      top: this.scrollHandle.parent().offset().top,
      left: this.scrollHandle.parent().offset().left,
      width: this.scrollHandle.parent().width(),
      height: this.scrollHandle.parent().height(),
      maxY: this.scrollHandle.parent().height() - this.scrollHandle.height(),
      maxX: this.scrollHandle.parent().width() - this.scrollHandle.width()
    };
    //获取滚动时他们之间的滚动关系倍数
    this.scrollBeishu = {
      y:
        ($('.scroll-content', object).height() -
          this.scrollHandle.parent().height()) /
        (this.scrollHandle.parent().height() - this.scrollHandle.height()),
      x:
        ($('.scroll-content', object).width() -
          this.scrollHandle.parent().width()) /
        (this.scrollHandle.parent().width() - this.scrollHandle.width())
    };

    //如果滚动区域没有溢出，就隐藏调滚动滑块
    if (
      (this.beishu.my >= 1 && this.dir == 'y') ||
      (this.beishu.mx >= 1 && this.dir == 'x')
    ) {
      //初始化鼠标按下时，鼠标相对于滑动句柄的偏移值
      this.mouseDownHandlePos = {
        top: null,
        left: null
      };
      this.scrollHandle
        .mousedown(function(e) {
          var _this = this;
          //当鼠标按下时，设置鼠标相对于滑动句柄的偏移值
          _this_.mouseDownHandlePos = {
            top: e.pageY - $(this).offset().top,
            left: e.pageX - $(this).offset().left
          };
          //当鼠标按下的时，就绑定document的鼠标移动事件
          $(document)
            .mousemove(function(e) {
              //当移动的时候清除掉选中文本
              if (document.selection && document.selection.empty) {
                //清楚IE选中文本
                document.selection.empty();
              } else if (window.getSelection) {
                //清楚FF选中文本
                window.getSelection().removeAllRanges();
              }
              //当鼠标在页面上移动的时候，实时计算出滑块的偏移值
              var offset = _this_.getScrollHandleOffset(
                {
                  top: e.pageY - _this_.scrollHandleAreaPos.top,
                  left: e.pageX - _this_.scrollHandleAreaPos.left
                },
                {
                  top: _this_.mouseDownHandlePos.top,
                  left: _this_.mouseDownHandlePos.left
                }
              );
              if (_this_.dir == 'y') {
                _this_.animateScroll(offset.top, _this);
              } else {
                _this_.animateScroll(offset.left, _this);
              }
            })
            .mouseup(function() {
              //当鼠标抬起的时候解绑定
              $(this).unbind('mousemove');
            });
        })
        .hover(
          function() {
            $(this).addClass('handle-hover');
          },
          function() {
            $(this).removeClass('handle-hover');
          }
        )
        .click(function(e) {
          e.stopPropagation();
        });
      //指定一个默认计数
      this.loop = 0;
      //给整个对象绑定滚轮事件
      if (window.addEventListener) {
        this.scrollObject.get(0).addEventListener(
          'DOMMouseScroll',
          function(e) {
            e.preventDefault();
            _this_.toHandleTopValue(e.detail, 20);
          },
          false
        );
        this.scrollObject.get(0).addEventListener(
          'mousewheel',
          function(e) {
            e.preventDefault();
            //为了兼容chrom
            _this_.toHandleTopValue(e.wheelDelta < 0 ? 120 : -120, 20);
          },
          false
        );
      } else {
        this.scrollObject.get(0).attachEvent('onmousewheel', function(e) {
          e.returnValue = false;
          _this_.toHandleTopValue(e.wheelDelta < 0 ? 120 : -120, 20);
        });
      }
      //绑定滑动轨道事件
      this.scrollTrack.click(function(evt) {
        _this_.toHandleTopValue(_this_.getScrollTrackOffset(evt), 55);
      });
      //改变鼠标样式
      if (this.dir == 'y') {
        this.scrollHandle.css('cursor', 'n-resize');
      } else {
        this.scrollHandle.css('cursor', 'e-resize');
      }
    } else {
      //如果内容没有溢出执行下列代码
      this.scrollTrack.remove();
      if (this.dir == 'y') {
        $('.scrollbar-area', this.scrollObject).width(
          this.scrollObject.width()
        );
      } else {
        $('.scrollbar-area', this.scrollObject).height(
          this.scrollObject.height()
        );
        $('.scroll-content', this.scrollObject).height(
          this.scrollObject.height()
        );
      }
    }
  }
  PZScrollbar.prototype = {
    //获取鼠标点击时，相对于滑动轨道的偏移
    getScrollTrackOffset: function(e) {
      if (this.dir == 'y') {
        return (
          e.pageY -
          this.scrollHandleAreaPos.top -
          (this.scrollHandle.height() +
            parseInt(this.scrollHandle.css('marginTop')))
        );
      } else {
        return (
          e.pageX -
          this.scrollHandleAreaPos.left -
          (this.scrollHandle.width() +
            parseInt(this.scrollHandle.css('marginLeft')))
        );
      }
    },
    //当滚轮滚动的时候驱动滑块的位置
    toHandleTopValue: function(e, step) {
      //判断鼠标的滚动方向
      if (e > 0) {
        this.loop += step;
        if (this.dir == 'y') {
          if (this.loop >= this.scrollHandleAreaPos.maxY) {
            this.loop = this.scrollHandleAreaPos.maxY;
          }
        } else {
          if (this.loop >= this.scrollHandleAreaPos.maxX) {
            this.loop = this.scrollHandleAreaPos.maxX;
          }
        }
        this.animateScroll(this.loop, this.scrollHandle);
      } else {
        this.loop -= step;
        if (this.loop <= 0) {
          this.loop = 0;
        }
        this.animateScroll(this.loop, this.scrollHandle);
      }
    },
    //驱动滚的区域
    animateScroll: function(margin, thisObj) {
      //在鼠标拖动的时候把偏移值设置给计数器
      this.loop = margin;
      //判断节点传递滚动方向
      if (this.dir == 'y') {
        $(thisObj).css('marginTop', margin + 'px');
        this.scrollContent.css(
          'marginTop',
          -margin * this.scrollBeishu.y + 'px'
        );
      } else {
        $(thisObj).css('marginLeft', margin + 'px');
        this.scrollContent.css(
          'marginLeft',
          -margin * this.scrollBeishu.x + 'px'
        );
      }
    },
    //模仿苹果手机滚动到边界的时候有缓冲
    scrollBuffer: function(type, scrollValue) {
      var _this = this;
      if (type == 'y') {
        if (scrollValue == 0) {
          this.scrollHandle.animate(
            { height: this.scrollHandle.height() / 2 },
            'fast',
            function() {
              $(this).animate(
                { height: _this.scrollHandle.height() * 2 - 1 },
                'fast'
              );
            }
          );
          this.scrollContent.animate({ marginTop: 50 }, 'fast', function() {
            $(this).animate({ marginTop: 0 }, 'fast');
          });
        }
      }
    },
    //按照比例设置滑块的尺寸
    setScrollHandleSize: function() {
      if (this.dir == 'y') {
        this.scrollHandle.height(
          this.scrollHandle.parent().height() / this.beishu.my + 'px'
        );
      } else {
        this.scrollHandle.width(
          this.scrollHandle.parent().width() / this.beishu.mx + 'px'
        );
      }
    },
    //计算出滑动句柄相对于滑动区域的便宜
    getScrollHandleOffset: function(mouse, offset) {
      var x, y;
      if (mouse.top - offset.top <= 0) {
        y = 0;
      } else {
        y = mouse.top - offset.top;
      }
      if (mouse.top - offset.top >= this.scrollHandleAreaPos.maxY) {
        y = this.scrollHandleAreaPos.maxY;
      }
      if (mouse.left - offset.left <= 0) {
        x = 0;
      } else {
        x = mouse.left - offset.left;
      }
      if (mouse.left - offset.left >= this.scrollHandleAreaPos.maxX) {
        x = this.scrollHandleAreaPos.maxX;
      }
      return { top: y, left: x };
    }
  };
  PZScrollbar.init = function(scrolls) {
    var _this = this;
    scrolls.each(function() {
      new _this($(this));
    });
  };
  window['PZScrollbar'] = PZScrollbar;
})();
