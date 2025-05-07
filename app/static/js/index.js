
    function showPopup() {
        document.getElementById('popup').style.display = 'block';
        document.getElementById('overlay').style.display = 'block';
        console.log('popup');
    }
    function closePopup() {
        document.getElementById('popup').style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
    }



    window.onload = function() {
        let chart = document.getElementById("chart");
        function chart_change(color_1st,ratio_1st,color_2nd,ratio_2nd,color_3rd,ratio_3rd,chart){   
            chart.style.background="conic-gradient("+color_1st+" 0%"+ratio_1st+"%, "+color_2nd+" "+ratio_1st+"% "+(ratio_1st+ratio_2nd)+"%, "+color_3rd+" "+(ratio_1st+ratio_2nd)+"% "+(ratio_1st+ratio_2nd+ratio_3rd)+"%)"
        }
        chart_change("#39CEF3",30,"blue",30,"#72CA3D",20,chart);}
      
  