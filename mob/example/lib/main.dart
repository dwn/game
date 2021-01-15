import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_webview_plugin/flutter_webview_plugin.dart';

const kAndroidUserAgent =
    'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Mobile Safari/537.36';

String selectedUrl = 'http://museumcloud.org';
String currentUrl = selectedUrl;
Size size;

void main() {
  runApp(new MyApp());
}
class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => new _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  Widget build(BuildContext context) {
    return new MaterialApp(
      title: 'The Bass',
      theme: new ThemeData(
        primarySwatch: Colors.blue,
      ),
      routes: {
        '/': (_) => const MyHomePage(title: 'The Bass'),
        '/widget': (_) => new WebviewScaffold(
          url: selectedUrl,
          appBar: new AppBar(
            title: const Text('Widget webview'),
          ),
          withZoom: true,
          withLocalStorage: true,
        )
      },
    );
  }
}

GestureDetector buildButtonColumn(IconData icon, FlutterWebviewPlugin flutterWebviewPlugin, int index) {
  return
  GestureDetector(
    child: Column(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(icon, color: const Color(0xFFFFFFFF))
      ],
    // ignore: return_of_invalid_type
    ),
    onTap: () {
      flutterWebviewPlugin.close();
      String nextUrl = '';
      if (index == 0) {
        nextUrl = 'http://18.207.177.89/index-en.html';
        if (currentUrl.contains('-es.') || currentUrl.contains('/es')) {
          String nextUrl = 'http://18.207.177.89/index-es.html';
        }
      } else {
        nextUrl = currentUrl;
        if (currentUrl.contains('-es.') || currentUrl.contains('/es')) {
          nextUrl = nextUrl.replaceAll('-es.', '-en.').replaceAll('/es', '/en');
        } else {
          nextUrl = nextUrl.replaceAll('-en.', '-es.').replaceAll('/en', '/es');
        }
      }
      flutterWebviewPlugin.launch(nextUrl,//clearCache: true,
          rect: new Rect.fromLTWH(
              0.0, 0.0,
              size.width, size.height - 45),
          userAgent: kAndroidUserAgent);
    },
  );
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({Key key, this.title}) : super(key: key);

  final String title;

  @override
  _MyHomePageState createState() => new _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  // Instance of WebView plugin
  final flutterWebviewPlugin = new FlutterWebviewPlugin();

  // On destroy stream
  StreamSubscription _onDestroy;

  // On urlChanged stream
  StreamSubscription<String> _onUrlChanged;

  // On urlChanged stream
  StreamSubscription<WebViewStateChanged> _onStateChanged;

  StreamSubscription<WebViewHttpError> _onHttpError;

  StreamSubscription<double> _onScrollYChanged;

  StreamSubscription<double> _onScrollXChanged;

  final _urlCtrl = new TextEditingController(text: selectedUrl);

  final _codeCtrl =
      new TextEditingController(text: 'window.navigator.userAgent');

  final _scaffoldKey = new GlobalKey<ScaffoldState>();

  final _history = [];

  @override
  void initState() {
    super.initState();
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);

    flutterWebviewPlugin.close();

    SystemChrome.setEnabledSystemUIOverlays([SystemUiOverlay.bottom]);

    _urlCtrl.addListener(() {
      selectedUrl = _urlCtrl.text;
    });

    // Add a listener to on destroy WebView, so you can make came actions.
    _onDestroy = flutterWebviewPlugin.onDestroy.listen((_) {
      if (mounted) {
        // Actions like show a info toast.
        _scaffoldKey.currentState.showSnackBar(
            const SnackBar(content: const Text('Webview Destroyed')));
      }
    });

    // Add a listener to on url changed
    _onUrlChanged = flutterWebviewPlugin.onUrlChanged.listen((String url) {
      currentUrl = url;
      if (mounted) {
        setState(() {
          _history.add('onUrlChanged: $url');
        });
      }
    });

    _onScrollYChanged =
        flutterWebviewPlugin.onScrollYChanged.listen((double y) {
      if (mounted) {
        setState(() {
          _history.add("Scroll in Y Direction: $y");
        });
      }
    });

    _onScrollXChanged =
        flutterWebviewPlugin.onScrollXChanged.listen((double x) {
      if (mounted) {
        setState(() {
          _history.add("Scroll in X Direction: $x");
        });
      }
    });

    _onStateChanged =
        flutterWebviewPlugin.onStateChanged.listen((WebViewStateChanged state) {
      if (mounted) {
        setState(() {
          _history.add('onStateChanged: ${state.type} ${state.url}');
        });
      }
    });

    _onHttpError =
        flutterWebviewPlugin.onHttpError.listen((WebViewHttpError error) {
      if (mounted) {
        setState(() {
          _history.add('onHttpError: ${error.code} ${error.url}');
        });
      }
    });
  }

  @override
  void dispose() {
    super.dispose();

    SystemChrome.setPreferredOrientations([
      DeviceOrientation.landscapeRight,
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);

    // Every listener should be canceled, the same should be done with this stream.
    _onDestroy.cancel();
    _onUrlChanged.cancel();
    _onStateChanged.cancel();
    _onHttpError.cancel();
    _onScrollXChanged.cancel();
    _onScrollYChanged.cancel();

    flutterWebviewPlugin.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    size = MediaQuery.of(context).size;

    BottomNavigationBar btm = new BottomNavigationBar(
      items: [
        new BottomNavigationBarItem(
            icon: new Icon(
              Icons.home,
              color: const Color(0xFFFFFFFF),
              size: 29.5
            ),
            title: Container(height: 0.0),
//            new Text(
//              "Home",
//              style: new TextStyle(
//                color: const Color(0xFFFFFFFF),
//              ),
            ),
        new BottomNavigationBarItem(
            icon: new Icon(
              Icons.settings,
              color: const Color(0xFFFFFFFF),
              size: 27.0
            ),
            title: Container(height: 0.0),
//            new Text(
//              "Language",
//              style: new TextStyle(
//                color: const Color(0xFFFFFFFF),
//              ),
            ),
      ],
      onTap: (int index) {
        flutterWebviewPlugin.close();
        String nextUrl = '';
        if (index == 0) {
          nextUrl = 'http://18.207.177.89/index-en.html';
          if (currentUrl.contains('-es.') || currentUrl.contains('/es')) {
            String nextUrl = 'http://18.207.177.89/index-es.html';
          }
        } else {
          nextUrl = currentUrl;
          if (currentUrl.contains('-es.') || currentUrl.contains('/es')) {
            nextUrl = nextUrl.replaceAll('-es.', '-en.').replaceAll('/es', '/en');
          } else {
            nextUrl = nextUrl.replaceAll('-en.', '-es.').replaceAll('/en', '/es');
          }
        }
        flutterWebviewPlugin.launch(nextUrl,//clearCache: true,
            rect: new Rect.fromLTWH(
                0.0, 0.0,
                size.width, size.height - 45),
            userAgent: kAndroidUserAgent);
      },
    );

    flutterWebviewPlugin.launch(selectedUrl,//clearCache: true,
    rect: new Rect.fromLTWH(
    0.0, 0.0,
    size.width, size.height - 45),
    userAgent: kAndroidUserAgent);

    return new Scaffold(
      appBar: new AppBar(
        title: new Text(
          widget.title,
          style: new TextStyle(color: const Color(0xFFFFFFFF)),
        ),
      ),
      bottomNavigationBar: new Theme(
        data: Theme.of(context).copyWith(
          // sets the background color of the `BottomNavigationBar`
          canvasColor: const Color(0xFF656565),
        ), // sets the inactive color of the `BottomNavigationBar`
        child:
          Container(
            height: 45.0,
            color: const Color(0xFF65656565),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                buildButtonColumn(Icons.home, flutterWebviewPlugin, 0),
                buildButtonColumn(Icons.settings, flutterWebviewPlugin, 1),
              ],
            ),
          ),
      ),
    );
  }
}
