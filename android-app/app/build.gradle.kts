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
        versionCode = 11
        versionName = "1.0.10-pivotfit"
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
}
