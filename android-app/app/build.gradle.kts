plugins {
    alias(libs.plugins.android.application)
}

android {
    namespace = "com.softsmith.devhub"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.softsmith.devhub"
        minSdk = 26
        targetSdk = 36
        versionCode = 25
        versionName = "2.1.2-order-radar-colors"
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
}
