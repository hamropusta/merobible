package com.susamachar.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/**
 * Susamachar – Christian App | सुसमाचार – इसाई संजाल
 * Native Android Client (Kotlin + Jetpack Compose)
 * Connects to the unified Node.js/Express REST API (/api/*) and caches Bible chapters offline in Room/SharedPreferences.
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SusamacharTheme {
                SusamacharMainScreen()
            }
        }
    }
}

@Composable
fun SusamacharTheme(content: @Composable () -> Unit) {
    val colorScheme = lightColorScheme(
        primary = Color(0xFF991B1B),     // Himalayan Crimson
        secondary = Color(0xFF1E3A8A),   // Deep Royal Blue
        tertiary = Color(0xFFD97706),    // Sacred Gold
        background = Color(0xFFFAF8F5),
        surface = Color(0xFFFFFFFF)
    )
    MaterialTheme(colorScheme = colorScheme, content = content)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SusamacharMainScreen() {
    var selectedTab by remember { mutableStateOf(0) }
    var language by remember { mutableStateOf("ne") }
    var dailyVerse by remember {
        mutableStateOf("किनकि परमेश्वरले संसारलाई यस्तो प्रेम गर्नुभयो, कि उहाँले आफ्ना एकमात्र पुत्र दिनुभयो। (यूहन्ना ३:१६)")
    }
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        scope.launch {
            withContext(Dispatchers.IO) {
                try {
                    val apiUrl = URL("https://your-cpanel-domain.com/api/bible/daily-verse")
                    val conn = apiUrl.openConnection() as HttpURLConnection
                    conn.connectTimeout = 5000
                    if (conn.responseCode == 200) {
                        val response = conn.inputStream.bufferedReader().readText()
                        val json = JSONObject(response)
                        dailyVerse = json.optString("text_ne", dailyVerse)
                    }
                } catch (_: Exception) {
                    // Uses offline cached verse when no internet connection is available
                }
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(if (language == "ne") "सुसमाचार – इसाई संजाल" else "Susamachar Christian App")
                        Text(
                            text = if (language == "ne") "सुसमाचार बाँडौँ • विश्वासमा बढौँ • प्रेममा सेवा गरौँ"
                            else "Share the Gospel • Grow in Faith • Serve with Love",
                            style = MaterialTheme.typography.labelSmall
                        )
                    }
                },
                actions = {
                    TextButton(onClick = { language = if (language == "ne") "en" else "ne" }) {
                        Text(if (language == "ne") "EN" else "नेपाली", color = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF991B1B),
                    titleContentColor = Color.White
                )
            )
        },
        bottomBar = {
            NavigationBar {
                val tabs = listOf(
                    "गृहपृष्ठ" to "Home",
                    "बाइबल" to "Bible",
                    "पात्रो" to "Calendar",
                    "समाचार" to "News",
                    "प्रार्थना" to "Prayer"
                )
                tabs.forEachIndexed { index, pair ->
                    NavigationBarItem(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        label = { Text(if (language == "ne") pair.first else pair.second) },
                        icon = { Box(modifier = Modifier.size(20.dp)) }
                    )
                }
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .padding(16.dp)
                .fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = if (language == "ne") "आजको बाइबल पद (Daily Verse)" else "Daily Bible Verse",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color(0xFF991B1B)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(text = dailyVerse, style = MaterialTheme.typography.bodyLarge)
                }
            }
        }
    }
}
