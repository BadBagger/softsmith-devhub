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
        versionCode = 23
        versionName = "2.1.0-order-radar"
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
}
