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

    var data = {"OkPercent": 52.15, "KoPercent": 47.85};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5157, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.52225, 500, 1500, "POST Create Character."], "isController": false}, {"data": [0.5255, 500, 1500, "DELETE Character"], "isController": false}, {"data": [0.47975, 500, 1500, "GET All Characters"], "isController": false}, {"data": [0.5255, 500, 1500, "GET Character By ID"], "isController": false}, {"data": [0.5255, 500, 1500, "PUT Update Character"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10000, 4785, 47.85, 20.528299999999938, 0, 712, 3.0, 23.899999999999636, 51.94999999999891, 573.9799999999996, 7552.870090634441, 22322.29586598376, 738.6352907854985], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["POST Create Character.", 2000, 949, 47.45, 13.998499999999995, 0, 698, 3.0, 16.0, 28.0, 322.99, 1545.595054095827, 1882.6857129057187, 176.87780742851623], "isController": false}, {"data": ["DELETE Character", 2000, 949, 47.45, 10.366000000000021, 0, 692, 3.0, 21.0, 29.0, 222.97000000000003, 1600.0, 1853.91640625, 190.7234375], "isController": false}, {"data": ["GET All Characters", 2000, 989, 49.45, 55.984499999999905, 0, 712, 3.0, 184.80000000000018, 557.5999999999985, 681.9000000000001, 1511.7157974300833, 15199.063001936887, 96.26780399659864], "isController": false}, {"data": ["GET Character By ID", 2000, 949, 47.45, 11.934000000000005, 0, 703, 3.0, 17.0, 27.0, 259.9000000000001, 1596.169193934557, 1884.3774940143658, 111.56661512370312], "isController": false}, {"data": ["PUT Update Character", 2000, 949, 47.45, 10.358500000000012, 0, 702, 3.0, 19.0, 27.0, 203.99, 1597.444089456869, 1862.3351075778753, 194.49973791932908], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2, 0.04179728317659352, 0.02], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 4390, 91.74503657262278, 43.9], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 243, 5.078369905956113, 2.43], "isController": false}, {"data": ["404/Not Found", 150, 3.134796238244514, 1.5], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10000, 4785, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 4390, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 243, "404/Not Found", 150, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["POST Create Character.", 2000, 949, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 898, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 51, "", "", "", "", "", ""], "isController": false}, {"data": ["DELETE Character", 2000, 949, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 833, "404/Not Found", 67, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 49, "", "", "", ""], "isController": false}, {"data": ["GET All Characters", 2000, 989, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 945, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 43, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", "", "", ""], "isController": false}, {"data": ["GET Character By ID", 2000, 949, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 870, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 47, "404/Not Found", 32, "", "", "", ""], "isController": false}, {"data": ["PUT Update Character", 2000, 949, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 844, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 53, "404/Not Found", 51, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
