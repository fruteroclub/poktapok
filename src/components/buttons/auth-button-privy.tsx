"use client";

import { type Dispatch, type SetStateAction } from "react";
import { useLogin, useLogout, usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type AuthButtonProps = {
  children?: React.ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg" | "xl" | "icon" | null | undefined;
  setIsMenuOpen?: Dispatch<SetStateAction<boolean>>;
};

export default function AuthButton({
  children,
  className,
  size = "default",
  setIsMenuOpen,
}: AuthButtonProps) {
  const { ready: isPrivyReady, authenticated } = usePrivy();
  const router = useRouter();

  const { login: loginWithPrivy } = useLogin({
    onComplete: async ({
      user: privyUser,
      isNewUser,
      wasAlreadyAuthenticated,
      loginMethod,
      loginAccount,
    }) => {
      console.log("User logged in successfully", privyUser);
      console.log("Is new user:", isNewUser);
      console.log("Was already authenticated:", wasAlreadyAuthenticated);
      console.log("Login method:", loginMethod);
      console.log("Login account:", loginAccount);

      // Skip if user was already authenticated (page refresh/navigation)
      if (wasAlreadyAuthenticated) {
        console.log("User was already authenticated, skipping login API call");
        return;
      }

      // Check session storage to prevent duplicate calls
      const sessionKey = `privy_login_processed_${privyUser.id}`;
      if (sessionStorage.getItem(sessionKey)) {
        console.log("Login already processed this session, skipping duplicate call");
        return;
      }

      try {
        // Mark this login as processed
        sessionStorage.setItem(sessionKey, "true");
        // Get the Ethereum embedded wallet address (not Solana)
        const embeddedWallet = privyUser.linkedAccounts?.find(
          (account) =>
            account.type === "wallet" &&
            "walletClientType" in account &&
            account.walletClientType === "privy" &&
            "chainType" in account &&
            account.chainType === "ethereum"
        );
        const appWallet =
          embeddedWallet && "address" in embeddedWallet
            ? embeddedWallet.address
            : undefined;

        // Get the Ethereum embedded wallet address (not Solana)
        const externalWallet = privyUser.linkedAccounts?.find(
          (account) =>
            account.type === "wallet" &&
            "walletClientType" in account &&
            account.walletClientType !== "privy" &&
            "chainType" in account &&
            account.chainType === "ethereum"
        );
        const extWallet =
          externalWallet && "address" in externalWallet
            ? externalWallet.address
            : undefined;

        console.log("All linked accounts:", privyUser.linkedAccounts);
        console.log("Ethereum embedded wallet:", appWallet);
        console.log("Ethereum external wallet:", extWallet);

        // Try to get email from Privy (optional - will be collected in onboarding if missing)
        const userEmail = privyUser.email?.address ||
                         privyUser.google?.email ||
                         privyUser.github?.email ||
                         privyUser.discord?.email ||
                         null;

        console.log("User email:", userEmail || "Not available");

        // Map Privy's loginMethod to our auth_method enum
        // Privy returns: email, sms, siwe (wallet), google, github, discord, twitter, etc.
        // Our enum: email, wallet, social
        let authMethod: "email" | "wallet" | "social" = "social";
        if (loginMethod === "email" || loginMethod === "sms") {
          authMethod = "email";
        } else if (loginMethod === "siwe" || loginMethod === "siws") {
          // Sign In With Ethereum/Solana = wallet auth
          authMethod = "wallet";
        } else {
          // github, google, discord, twitter, etc. → social
          authMethod = "social";
        }

        // Prepare user data for API
        const userData = {
          privyDid: privyUser.id,
          email: userEmail,
          appWallet: appWallet || null,
          extWallet: extWallet || null,
          primaryAuthMethod: authMethod,
        };

        // Create or fetch user from database
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        const responseData = await response.json();

        if (!response.ok) {
          console.error("API Error:", responseData);
          const errorMessage = responseData.error?.message || responseData.error || "Failed to create/fetch user";
          throw new Error(errorMessage);
        }

        // Handle new API response pattern: { success: true, data: { user, profile } }
        const user = responseData.data?.user || responseData.user;

        if (!user) {
          console.error("No user data in response:", responseData);
          throw new Error("Failed to get user data from server");
        }

        // Redirect based on account status
        if (!wasAlreadyAuthenticated) {
          if (user.accountStatus === "incomplete") {
            // User created but needs to complete onboarding
            router.push("/onboarding");
            toast.success("¡Bienvenido! Completa tu perfil para continuar", {
              id: "auth-welcome", // Deduplicate toasts
            });
          } else if (user.accountStatus === "pending") {
            // Onboarding complete, waiting for approval
            router.push("/profile");
            toast.success("Perfil completo. Esperando aprobación", {
              id: "auth-pending", // Deduplicate toasts
            });
          } else if (user.accountStatus === "active") {
            // Approved and active
            router.push("/dashboard");
            toast.success("Sesión iniciada correctamente", {
              id: "auth-success", // Deduplicate toasts
            });
          } else {
            // Suspended or banned
            toast.error("Cuenta suspendida. Contacta soporte", {
              id: "auth-suspended", // Deduplicate toasts
            });
          }
        }

        setIsMenuOpen?.(false);
      } catch (error) {
        console.error("Error creating/fetching user:", error);
        toast.error("Error al iniciar sesión. Por favor, intenta de nuevo.", {
          id: "auth-error", // Deduplicate toasts across multiple AuthButton instances
        });
      }
    },
    onError: (error) => {
      console.log("Login failed", error);
      toast.error("Inicio de sesión fallido", {
        id: "login-failed", // Deduplicate toasts across multiple AuthButton instances
      });
    },
  });
  const { logout: logoutWithPrivy } = useLogout();

  // const disableLogin = !isPrivyReady || (isPrivyReady && authenticated);

  function login() {
    if (!authenticated) {
      loginWithPrivy();
    } else {
      toast.warning("ya existe una sesión activa", {
        id: "auth-already-active", // Deduplicate toasts
      });
    }
  }
  async function logout() {
    // Clear session storage on logout
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("privy_login_processed_")) {
        sessionStorage.removeItem(key);
      }
    });

    await logoutWithPrivy();
    router.push("/");
    setIsMenuOpen?.(false);
    toast.success("Sesión cerrada correctamente", {
      id: "auth-logout", // Deduplicate toasts
    });
  }

  if (!isPrivyReady) {
    return (
      <Button
        onClick={() => console.log("Privy not ready")}
        size={size}
        className={cn("font-funnel font-medium", className)}
        disabled
      >
        {authenticated ? "Salir" : children || "Entrar"}
      </Button>
    );
  }

  return (
    <Button
      onClick={authenticated ? logout : login}
      size={size}
      className={cn("font-funnel font-medium", className)}
    >
      {authenticated ? "Salir" : children || "Entrar"}
    </Button>
  );
}
