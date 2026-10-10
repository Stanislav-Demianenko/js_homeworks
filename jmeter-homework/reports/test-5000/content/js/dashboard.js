/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 25.744, "KoPercent": 74.256};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.25413, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.256625, 500, 1500, "POST Create Character."], "isController": false}, {"data": [0.259025, 500, 1500, "DELETE Character"], "isController": false}, {"data": [0.2371, 500, 1500, "GET All Characters"], "isController": false}, {"data": [0.25895, 500, 1500, "GET Character By ID"], "isController": false}, {"data": [0.25895, 500, 1500, "PUT Update Character"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100000, 74256, 74.256, 20.491079999999865, 0, 3143, 1.0, 9.0, 19.0, 331.9900000000016, 12468.827930174564, 33064.08697494545, 612.2042306343517], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["POST Create Character.", 20000, 14819, 74.095, 15.927200000000004, 0, 2987, 0.0, 11.0, 64.0, 391.0, 2516.6729583490624, 4464.857513055241, 141.9761142176293], "isController": false}, {"data": ["DELETE Character", 20000, 14819, 74.095, 13.344650000000023, 0, 2679, 1.0, 14.0, 46.0, 323.0, 2528.4450063211125, 4361.593068505057, 153.87785437737043], "isController": false}, {"data": ["GET All Characters", 20000, 14980, 74.9, 41.17529999999978, 0, 3143, 0.0, 25.0, 116.0, 877.0, 2494.0765681506423, 15683.829639956664, 78.86299335952114], "isController": false}, {"data": ["GET Character By ID", 20000, 14819, 74.095, 17.557450000000056, 0, 1240, 0.0, 15.0, 93.0, 401.9800000000032, 2526.528549772612, 4391.362726598029, 88.62489735977766], "isController": false}, {"data": ["PUT Update Character", 20000, 14819, 74.095, 14.450800000000035, 0, 2208, 1.0, 13.0, 60.0, 335.0, 2527.1670457417235, 4379.693768558883, 155.47926340978015], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 465, 0.6262120232708468, 0.465], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 63912, 86.06981254040078, 63.912], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 8723, 11.74719887955182, 8.723], "isController": false}, {"data": ["404/Not Found", 1156, 1.5567765567765568, 1.156], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100000, 74256, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 63912, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 8723, "404/Not Found", 1156, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 465, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["POST Create Character.", 20000, 14819, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 12938, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 1806, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 75, "", "", "", ""], "isController": false}, {"data": ["DELETE Character", 20000, 14819, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 12462, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 1742, "404/Not Found", 522, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 93, "", ""], "isController": false}, {"data": ["GET All Characters", 20000, 14980, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 13149, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 1699, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 132, "", "", "", ""], "isController": false}, {"data": ["GET Character By ID", 20000, 14819, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 12726, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 1749, "404/Not Found", 250, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 94, "", ""], "isController": false}, {"data": ["PUT Update Character", 20000, 14819, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 12637, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 1727, "404/Not Found", 384, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 71, "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
