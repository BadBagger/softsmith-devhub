import java.io.FileInputStream
import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
}

val releaseKeystorePropertiesFile = rootProject.file("keystore.properties")
val releaseKeystoreProperties = Properties()
val releaseSigningIssues = mutableListOf<String>()

if (releaseKeystorePropertiesFile.exists()) {
    FileInputStream(releaseKeystorePropertiesFile).use { releaseKeystoreProperties.load(it) }

    listOf("storeFile", "storePassword", "keyAlias", "keyPassword").forEach { propertyName ->
        if (releaseKeystoreProperties.getProperty(propertyName).isNullOrBlank()) {
            releaseSigningIssues += "Missing required property '$propertyName' in keystore.properties."
        }
    }

    val configuredStoreFile = releaseKeystoreProperties.getProperty("storeFile")
    if (!configuredStoreFile.isNullOrBlank() && !file(configuredStoreFile).exists()) {
        releaseSigningIssues += "Configured release storeFile does not exist."
    }
} else {
    releaseSigningIssues += "Missing android-app/keystore.properties. Copy keystore.properties.example and fill it locally."
}

val releaseSigningReady = releaseSigningIssues.isEmpty()

android {
    namespace = "com.softsmith.devhub"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.softsmith.devhub"
        minSdk = 26
        targetSdk = 36
        versionCode = 74
        versionName = "2.1.51-notepilot"
    }

    signingConfigs {
        create("release") {
            if (releaseSigningReady) {
                storeFile = file(releaseKeystoreProperties.getProperty("storeFile"))
                storePassword = releaseKeystoreProperties.getProperty("storePassword")
                keyAlias = releaseKeystoreProperties.getProperty("keyAlias")
                keyPassword = releaseKeystoreProperties.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
        }
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
}

tasks.matching {
    it.name == "assembleRelease" ||
        it.name == "bundleRelease" ||
        it.name == "packageRelease"
}.configureEach {
    doFirst {
        if (!releaseSigningReady) {
            throw GradleException(
                "Release signing is not configured. " +
                    releaseSigningIssues.joinToString(" ") +
                    " Do not use the Android debug key for release builds."
            )
        }
    }
}
