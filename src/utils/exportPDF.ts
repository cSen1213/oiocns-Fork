import { message } from 'antd';
import html2Canvas from 'html2canvas';
import JsPDF from 'jspdf';

export function exportPDF(id: string, titleStr: string) {
  const title: string = titleStr || '标题'; // 导出文件名，默认为“标题”
  // 这里获取调用这个方法传过来的参数对象里面的类名，也就是需要导出为pdf元素的父盒子类名
  const ele = document.getElementById(id || 'pdf-cell');
  ele!.style.width = '300px';
  // 为做分页做准备，因为分页是根据每一个dom元素的高度来决定的，也不用细化到每一个dom元素，只是不希望被截断的dom元素都需要单独的拿出来计算高度，而不能获取整个大页面的高度
  // 这里的children取决于传过来的父元素，根据实际需求来获取需要的子元素
  const children: any = ele!.children;

  // 定义一个空数组，来接收需要生成图片计算完高度的dom对象
  let canvas: any[] = [];
  //  这里的 i 和 j 根据实际需求添加  i 是定义的children的每一个dom元素的索引，每计算完一个高度，进行++运算然后递归
  let i = 0;
  // 这里的 j 是如果需要对定义的children的子元素更深层的遍历的话，需要拿到他下面的子元素高度的话，就另定义一个j变量，进行++运算再递归(无需所以注释掉了)
  // let j = 0;
  // scale是清晰度参数 数值越大，对应的清晰度越清晰，但是相对导出的文件大小也就越大，慎重修改，这里是根据你的窗口大小做判断
  const scale = window.devicePixelRatio > 1 ? window.devicePixelRatio : 2;
  // 将dom转化为canvas
  function toCanvas() {
    html2Canvas(children[i], {
      scale: 1,
      dpi: 200, // 导出pdf清晰度
      backgroundColor: '#F0F2F5', // 背景设为灰色（默认为黑色）
      allowTaint: true,
      taintTest: true,
    }).then((res: any) => {
      // 计算每个dom的高度，方便后面计算分页
      res.imgWidth = 595.28 / scale / 0.53;
      res.imgHeight = ((592.28 / res.width) * res.height) / scale / 0.53;
      canvas.push(res);
      i++;
      // 这里判断我是否已经全部将需要计算高度的节点计算完了，如果计算完高度就会添加到我定义的canvas数组里面，计算完了就执行分页并生成pdf，否则递归继续计算
      if (canvas.length === children.length) {
        paging();
        toPdf();
      } else {
        toCanvas();
        message.destroy();
        message.loading(`正在遍历第${[i]}个报表元素，请不要关闭窗口！`);
      }
    });
    // 这里是深层遍历时用到的判断，单独计算第三个子元素的每个子元素的高度，所以如果 i>1了也就意味着遍历到第三个节点了，第三个节点我要再去获取里面的子元素，在这里面在进行转化canvas(无需所以注释掉了)
    // else {
    //     html2Canvas(children[i], {
    //         scale: scale,
    //         useCORS: true,
    //         dpi: 500, // 导出pdf清晰度
    //         background: '#F0F2F5', // 背景设为灰色（默认为黑色）
    //         height: document.getElementById(id).scrollHeight,
    //         windowHeight: document.getElementById(id).scrollHeight
    //     }).then(res => { // 计算每个dom的高度，方便后面计算分页
    //         console.log("55555555555555555", res);
    //         res.imgWidth = 595.28 / scale / 0.7;
    //         res.imgHeight = 592.28 / res.width * res.height / scale / 0.7;
    //         canvas.push(res);
    //         j++;
    //         console.log("******************", canvas);
    //         if (canvas.length === children.length + children[2].children.length - 1) {
    //             paging();
    //             toPdf();
    //         } else {
    //             toCanvas();
    //         }
    //     });

    // }
  }
  /**
   * [根据dom的高度初步进行分页，会将canvas组装为一个二维数组]
   */
  // dom 全部转化完成 开始计算分页
  function paging() {
    const imgArr: any[] = [[]];
    let pageH = 0; // 页面的高度
    let allH = 0; // 当前组所有dom的高度和
    let j = 0;
    for (let k = 0; k < canvas.length; k++) {
      // 涉及到k--的操作，使用for循环方便
      pageH += canvas[k].imgHeight;
      if (pageH > 841.89 && canvas[k].imgHeight < 841.89) {
        // 当某个页面装不下下一个dom时，则分页
        imgArr[j][0].allH = allH - canvas[k].imgHeight;
        allH = pageH = 0;
        k--;
        j++;
        imgArr.push([]);
      } else {
        if (canvas[k].imgHeight > 841.89) {
          // 特殊情况：某个dom高度大于了页面高度，特殊处理
          canvas[k].topH = 841.89 - (pageH - canvas[k].imgHeight); // 该dom顶部距离页面上方的距离
          pageH = (2 * canvas[k].imgHeight - pageH) % 841.89;
          canvas[k].pageH = pageH; // 该dom底部距离页面上方的距离
        }
        imgArr[j].push(canvas[k]);
        allH += canvas[k].imgHeight;
      }
      if (k === canvas.length - 1) imgArr[j][0].allH = allH;
    }
    canvas = imgArr;
  }
  /**
   * [生成PDF文件]
   */
  function toPdf() {
    const PDF = new JsPDF('p', 'pt', 'a4');
    canvas.forEach((page, index) => {
      let allH = page[0].allH;
      let position = 20; // pdf页面偏移
      if (index !== 0 && allH <= 841.89) PDF.addPage();
      page.forEach(
        (img: {
          imgHeight: number;
          toDataURL: (arg0: string, arg1: number) => any;
          imgWidth: number;
          topH: number;
          pageH: number;
        }) => {
          if (img.imgHeight < 841.89) {
            // 当某个dom高度小于页面宽度，直接添加图片
            // 这里的width除以多少取决于导出的页面在pdf页里面横向偏移的多少，可以修改这个除数进行对页面的横向调整
            PDF.addImage(
              img.toDataURL('image/jpeg', 1.0),
              'JPEG',
              img.imgWidth / 33,
              position,
              img.imgWidth,
              img.imgHeight,
            );
            position += img.imgHeight;
            allH -= img.imgHeight;
          } else {
            // 当某个dom高度大于页面宽度，则需另行处理
            while (allH > 0) {
              PDF.addImage(
                img.toDataURL('image/jpeg', 1.0),
                'JPEG',
                img.imgWidth / 5,
                position,
                img.imgWidth,
                img.imgHeight,
              );
              allH -= img.topH || 841.89;
              position -= img.topH || 841.89;
              img.topH = 0;
              if (allH > 0) PDF.addPage();
            }
            position = img.pageH;
          }
        },
      );
    });
    PDF.save(title + '.pdf');
    message.destroy();
    message.success('生成PDF成功');
  }
  toCanvas();
}
