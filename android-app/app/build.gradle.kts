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
        versionCode = 8
        versionName = "1.0.7-new-icons"
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
}
